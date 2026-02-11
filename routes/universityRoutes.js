const express = require("express");

const router = express.Router();

const universityController = require("../controllers/universityController");

router.route("/").get(universityController.getAllUniversities);
router.route("/:id").get(universityController.getUniversity);
