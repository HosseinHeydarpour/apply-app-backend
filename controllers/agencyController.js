const Agency = require("../model/agencyModel");

exports.getAllAgencies = (req, res) => {
  res.status(200).json({
    status: "success",
  });
};

exports.getAgency = (req, res) => {};

exports.createAgency = async (req, res) => {
  try {
    const newAgency = await Agency.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        agency: newAgency,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      // message: error.message,
      message: "Failed to create agency",
    });
  }
};

exports.updateAgency = (req, res) => {};

exports.deleteAgency = (req, res) => {};
