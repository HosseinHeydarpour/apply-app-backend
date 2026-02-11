const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const authController = require("../controllers/authController");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword,
);

// route for updating user data
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.updateMe,
);

router.post(
  "/upload-passport",
  authController.protect,
  userController.uploadDocumentMiddleware, // Matches upload.single('document')
  userController.uploadDocument,
);

router.route("/").get(userController.getAllUsers);

router.route("/:id").get(userController.getUser);

module.exports = router;
