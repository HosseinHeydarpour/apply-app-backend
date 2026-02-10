const Agency = require("../model/agencyModel");

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.email) {
    return res.status(400).json({
      status: "error",
      message: "Name and email are required",
    });
  }
  next();
};

exports.getAllAgencies = (req, res) => {
  res.status(200).json({
    status: "success",
  });
};

exports.getAgency = (req, res) => {};

exports.createAgency = (req, res) => {};

exports.updateAgency = (req, res) => {};

exports.deleteAgency = (req, res) => {};
