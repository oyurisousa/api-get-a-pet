//helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const validateId = require("../helpers/validate-id");
const verifyToken = require("../helpers/verify-token");
const ObjectId = require("mongoose").Types.ObjectId;

const Pet = require("../models/Pet");

module.exports = class PetController {
	// create a pet
	static async create(req, res) {
		const { name, age, weight, color } = req.body;

		const images = req.files;
		const available = true;

		//images upload

		//validations
		if (!name) {
			res.status(422).json({ message: "the name field is required!" });
			return;
		}
		if (!age) {
			res.status(422).json({ message: "the age field is required!" });
			return;
		}
		if (!weight) {
			res.status(422).json({ message: "the weight field is required!" });
			return;
		}
		if (!color) {
			res.status(422).json({ message: "the color field is required!" });
			return;
		}
		if (images.length === 0) {
			res.status(422).json({ message: "the images field is required!" });
			return;
		}

		//get pet owner
		const token = getToken(req);
		const user = await getUserByToken(token);

		//create the pet
		const pet = new Pet({
			name,
			age,
			weight,
			color,
			images: [],
			available,
			user: {
				_id: user._id,
				name: user.name,
				image: user.image,
				phone: user.phone,
			},
		});
		images.map((image) => {
			pet.images.push(image.filename);
		});
		try {
			const newPet = await pet.save();
			res.status(201).json({
				message: "pet register sucessfully!",
				newPet,
			});
		} catch (error) {
			res.status(500).json({ message: error });
		}
	}

	static async getAll(req, res) {
		const pets = await Pet.find().sort("-createdAt");
		res.status(200).json({ pets });
	}

	static async getAllUserPets(req, res) {
		const token = getToken(req);
		const user = await getUserByToken(token);
		const myPets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
		res.status(200).json({
			myPets,
		});
	}

	static async getAllUserAdoptions(req, res) {
		const token = getToken(req);
		const user = await getUserByToken(token);

		const myPets = await Pet.find({ "adopter._id": user._id }).sort(
			"-createdAt"
		);
		res.status(200).json({
			myPets,
		});
	}

	static async getPetById(req, res) {
		const id = req.params.id;

		if (ObjectId.isValid(id)) {
			const pet = await Pet.findOne({ _id: id });
			if (!pet) {
				res.status(404).json({
					message: "pet not found",
				});
				return;
			}

			res.status(200).json({ pet });
		} else {
			res.status(422).json({ message: "id invalid!" });
			return;
		}
	}

	static async removePetbyId(req, res) {
		const id = req.params.id;

		if (ObjectId.isValid(id)) {
			const pet = await Pet.findOne({ _id: id });
			if (!pet) {
				res.status(404).json({
					message: "pet not found",
				});
				return;
			}
			const token = getToken(req);
			const user = await getUserByToken(token);
			if (pet.user._id.toString() != user._id.toString()) {
				res.status(422).json({
					message: "you can only remove pets that you have regitered!",
				});
				return;
			}
			await Pet.findByIdAndDelete(id);
			res.status(200).json({ message: "remove pet sucessfuly!" });
			return;
		} else {
			res.status(422).json({ message: "id invalid!" });
			return;
		}
	}

	static async updatePetById(req, res) {
		const id = req.params.id;
		const name = req.body.name;
		const age = req.body.age;
		const description = req.body.description;
		const weight = req.body.weight;
		const color = req.body.color;
		const images = req.files;
		const available = req.body.available;

		const updateData = {};

		// check if pet exists
		const pet = await Pet.findOne({ _id: id });

		if (!pet) {
			res.status(404).json({ message: "Pet não encontrado!" });
			return;
		}

		// check if user registered this pet
		const token = getToken(req);
		const user = await getUserByToken(token);

		if (pet.user._id.toString() != user._id.toString()) {
			res.status(404).json({
				message:
					"Houve um problema em processar sua solicitação, tente novamente mais tarde!",
			});
			return;
		}

		// validations
		if (!name) {
			res.status(422).json({ message: "O nome é obrigatório!" });
			return;
		} else {
			updateData.name = name;
		}

		if (!age) {
			res.status(422).json({ message: "A idade é obrigatória!" });
			return;
		} else {
			updateData.age = age;
		}

		if (!weight) {
			res.status(422).json({ message: "O peso é obrigatório!" });
			return;
		} else {
			updateData.weight = weight;
		}

		if (!color) {
			res.status(422).json({ message: "A cor é obrigatória!" });
			return;
		} else {
			updateData.color = color;
		}

		if (images.length > 0) {
			updateData.images = [];
			images.map((image) => {
				updateData.images.push(image.filename);
			});
		}

		if (!available) {
			res.status(422).json({ message: "O status é obrigatório!" });
			return;
		} else {
			updateData.available = available;
		}

		updateData.description = description;
		console.log(req.body);
		await Pet.findByIdAndUpdate(id, updateData);

		res.status(200).json({ pet: pet, message: "Pet atualizado com sucesso!" });
	}

	static async schedule(req, res) {
		const { id } = req.params;
		if (ObjectId.isValid(id)) {
			const pet = await Pet.findOne({ _id: id });
			if (!pet) {
				res.status(404).json({
					message: "pet not found",
				});
				return;
			}

			//check if is my pet
			const token = getToken(req);
			const user = await getUserByToken(token);

			if (pet.user._id.equals(user._id)) {
				res
					.status(422)
					.json({ message: "you cannot schedule a pet that you registred!" });
				return;
			}

			//check if user has already scheduled a visit
			if (pet.adopter) {
				if (pet.adopter._id.equals(user._id)) {
					res
						.status(422)
						.json({ message: "you has already schedule this pet!" });
				}
			} else {
				//add user to pet
				pet.adopter = {
					_id: new ObjectId(user.id),
					name: user.name,
					image: user.image,
				};
				await Pet.findByIdAndUpdate(id, pet);
				res
					.status(200)
					.json({ message: "you scheduled your visit sucessfully!" });
			}
		} else {
			res.status(422).json({ message: "invalid id" });
		}
	}

	static async concludeAdoption(req, res) {
		const id = req.params.id;
		var pet;
		if (ObjectId.isValid(id)) {
			pet = await Pet.findOne({ _id: id });
			if (!pet) {
				res.status(404).json({
					message: "pet not found",
				});
				return;
			}
		} else {
			res.status(422).json({ message: "invalid id" });
			return;
		}

		const token = getToken(req);
		const user = await getUserByToken(token);
		if (!pet.user._id.equals(user._id)) {
			res.status(422).json({
				message:
					"you dont conclude a schedule of a pet that you dont registered!",
			});
		}
		pet.available = false;

		await Pet.findByIdAndUpdate(id, pet);

		res
			.status(200)
			.json({ message: "the pet adoption process was completed sucessfully!" });
	}
};
