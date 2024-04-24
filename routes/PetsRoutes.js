const router = require("express").Router();
const PetController = require("../controller/PetController");

//middlewares
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

router.post(
	"/create",
	verifyToken,
	imageUpload.array("images"),
	PetController.create
);
router.get("/", PetController.getAll);
router.get("/mypets", verifyToken, PetController.getAllUserPets);
router.get("/myadoptions", verifyToken, PetController.getAllUserAdoptions);
router.get("/:id", PetController.getPetById);
router.patch(
	"/edit/:id",
	verifyToken,
	imageUpload.array("images"),
	PetController.updatePetById
);
router.patch("/schedule/:id", verifyToken, PetController.schedule);
router.patch("/conclude/:id", verifyToken, PetController.concludeAdoption);
router.delete("/:id", verifyToken, PetController.removePetbyId);

module.exports = router;
