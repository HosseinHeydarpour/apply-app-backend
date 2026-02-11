const express = require("express");

const router = express.Router();

const universityController = require("../controllers/universityController");

router
  .route("/top")
  .get(
    universityController.aliasTopUniversities,
    universityController.getAllUniversities,
  );
router.route("/").get(universityController.getAllUniversities);
router.route("/:id").get(universityController.getUniversity);

module.exports = router;
