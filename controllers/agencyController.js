const Agency = require("../model/agencyModel");

exports.getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.status(200).json({
      status: "success",
      results: agencies.length,
      data: {
        agencies,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getAgency = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        agency,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

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

exports.updateAgency = async (req, res) => {
  try {
    const agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        agency,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteAgency = async (req, res) => {
  try {
    await Agency.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "Tour deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
