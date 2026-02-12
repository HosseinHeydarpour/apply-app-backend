const express = require("express");

const router = express.Router();

const adController = require("../controllers/adsController");

router.route("/").get(adController.getAllAds);

module.exports = router;
