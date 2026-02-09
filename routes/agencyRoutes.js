const express = require("express");

const router = express.Router();

const agencyController = require("../controllers/agencyController");

router.param("id", agencyController.checkID);

router
  .route("/")
  .get(agencyController.getAllAgencies)
  .post(agencyController.checkBody, agencyController.createAgency);
router
  .route("/:id")
  .get(agencyController.getAgency)
  .patch(agencyController.updateAgency)
  .delete(agencyController.deleteAgency);

module.exports = router;
