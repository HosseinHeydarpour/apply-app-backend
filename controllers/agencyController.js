const Agency = require("../model/agencyModel");

exports.getAllAgencies = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Agency.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field filtering
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const agenciesCount = await Agency.countDocuments();
      if (skip >= agenciesCount) throw new Error("This page does not exist.");
    }

    const agencies = await query;
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

exports.aliasTopAgencies = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-rating";
  next();
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
