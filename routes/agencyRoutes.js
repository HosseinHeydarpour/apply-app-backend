const express = require("express");

const router = express.Router();

const agencyController = require("../controllers/agencyController");

const authController = require("../controllers/authController");

router
  .route("/top-agencies")
  .get(agencyController.aliasTopAgencies, agencyController.getAllAgencies);

router
  .route("/")
  .get(authController.protect, agencyController.getAllAgencies)
  .post(agencyController.createAgency);
router
  .route("/:id")
  .get(agencyController.getAgency)
  .patch(agencyController.updateAgency)
  .delete(agencyController.deleteAgency);

module.exports = router;
