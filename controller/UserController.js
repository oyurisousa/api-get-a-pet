const jwt = require("jsonwebtoken");

const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const validateId = require("../helpers/validate-id");
const getUserByToken = require("../helpers/get-user-by-token");

const User = require("../models/User");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const env = require("../env");

module.exports = class UserController {
	static async register(req, res) {
		const { name, email, phone, password, confirmpassword } = req.body;

		//validations fields
		if (!name) {
			res.status(422).json({ message: "the name field is required" });
			return;
		}
		if (!email) {
			res.status(422).json({ message: "the email field is required" });
			return;
		}
		if (!phone) {
			res.status(422).json({ message: "the phone field is required" });
			return;
		}
		if (!password) {
			res.status(422).json({ message: "the password field is required" });
			return;
		}
		if (!confirmpassword) {
			res
				.status(422)
				.json({ message: "the confirm password field is required" });
			return;
		} else if (password !== confirmpassword) {
			res.status(422).json({ message: "passwords don't match!" });
		}
		//check if user existss
		const userExists = await User.findOne({ email: email });

		if (userExists) {
			res.status(422).json({ message: "User exists" });
			return;
		}

		//create a password
		const salt = await bcrypt.genSalt(12);
		const passwordHash = await bcrypt.hash(password, salt);

		//create user
		const user = new User({
			name,
			email,
			phone,
			password: passwordHash,
		});
		try {
			const newUser = await user.save();
			await createUserToken(newUser, req, res);
		} catch (error) {
			res.status(500).json({ message: error });
		}
	}

	static async login(req, res) {
		const { email, password } = req.body;

		if (!email) {
			res.status(422).json({ message: "the email field is required" });
			return;
		}
		if (!password) {
			res.status(422).json({ message: "the password field is required" });
			return;
		}

		//check if user existss
		const user = await User.findOne({ email: email });

		if (!user) {
			res.status(422).json({ message: "this user does not exists!" });
			return;
		}

		//check password match

		const checkMacthPassword = await bcrypt.compare(password, user.password);
		if (!checkMacthPassword) {
			res.status(422).json({
				message: `password incorrect!`,
			});
			return;
		}

		await createUserToken(user, req, res);
	}

	static async checkUser(req, res) {
		let currentUser;
		console.log(req.headers.authorization);
		if (req.headers.authorization) {
			const token = getToken(req);
			const decoded = jwt.verify(token, env.WORD_SECRET);
			currentUser = await User.findById(decoded.id);

			currentUser.password = undefined;
		} else {
			currentUser = null;
		}
		res.status(200).send(currentUser);
	}

	static async getUserById(req, res) {
		const { id } = req.params;
		let user;
		if (mongoose.Types.ObjectId.isValid(id)) {
			//validation id
			user = await User.findById(id).select("-password");
		}

		if (!user) {
			res.status(422).json({
				message: `user not found!`,
			});
			return;
		}

		res.status(200).json({ user });
	}

	static async editUser(req, res) {
		const id = req.params.id;
		const { name, email, phone, password, confirmpassword } = req.body;
		let user;
		//validate id
		if (validateId(id)) {
			const token = getToken(req);
			user = await getUserByToken(token);
		} else {
			return res.status(200).json({
				message: `id invalid! ${id}`,
			});
		}

		if (req.file) {
			user.image = req.file.filename;
		}
		if (!name) {
			res.status(422).json({ message: "the name field is required" });
			return;
		}
		user.name = name;
		if (!email) {
			res.status(422).json({ message: "the email field is required" });
			return;
		}
		const userExists = await User.findOne({ email: email });

		if (user.email !== userExists.email && userExists) {
			res.status(422).json({ message: "please, user other email" });
			return;
		}
		user.email = email;

		if (!phone) {
			res.status(422).json({ message: "the phone field is required" });
			return;
		}
		user.phone = phone;
		if (password !== confirmpassword) {
			res.status(422).json({ message: "passwords don't match!" });
			return;
		} else if (password == confirmpassword && password != null) {
			const salt = await bcrypt.genSalt(12);
			const passwordHash = await bcrypt.hash(password, salt);
			user.password = passwordHash;
		}
		try {
			const updateUser = await User.findOneAndUpdate(
				{ _id: user.id },
				{ $set: user },
				{ new: true },
				res.status(200).json({ message: "User update sucessfully!" })
			);
		} catch (error) {
			res.status(500).json({
				message: error,
			});
			return;
		}
	}
};
