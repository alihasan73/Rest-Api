const express = require("express");
const router = express.Router();
const userController = require("../controllers").userController;
const { fileUploader } = require("../middleware/multer");
router.post("/register", userController.insertUserV1);
router.post("/login", userController.getLogin);
router.get("/login2", userController.getLoginV2);
router.get("/token", userController.getByToken);
router.get(
	"/token2",
	userController.getByTokenV2,
	userController.getUserByToken
);
router.patch(
	"/token3",
	userController.getByTokenV2,
	userController.changePassword
);

router.get("/forgotPass/req", userController.generateTokenByEmail);

router.post(
	"/uploadImg/:id",
	fileUploader({ destinationFolder: "avatar" }).single("avatar"),
	userController.uploadAvatar
);

module.exports = router;
