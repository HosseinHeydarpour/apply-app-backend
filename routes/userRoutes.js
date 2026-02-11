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
  userController.uploadUserPhoto,
  authController.updatePassword,
);

// route for updating user data

router.patch("/updateMe", authController.protect, userController.updateMe);

router
  .route("/upload-document")
  .post(
    authController.protect,
    userController.uploadDocumentMiddleware,
    userController.uploadDocument,
  );

router.post("/apply", authController.protect, userController.applyToUniversity);
router.post(
  "/consultation",
  authController.protect,
  userController.requestConsultation,
);

router.get("/history", authController.protect, userController.getUserHistory);

router.route("/").get(authController.protect, userController.getAllUsers);

router.route("/:id").get(authController.protect, userController.getUser);

module.exports = router;
