const Agency = require("../model/agencyModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.aliasTopAgencies = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-rating";
  next();
};
exports.getAllAgencies = catchAsync(async (req, res) => {
  const features = new APIFeatures(Agency.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const agencies = await features.query;

  res.status(200).json({
    status: "success",
    results: agencies.length,
    data: {
      agencies,
    },
  });
});

exports.getAgency = catchAsync(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return next(new AppError("Agency not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      agency,
    },
  });
});

exports.createAgency = catchAsync(async (req, res) => {
  const newAgency = await Agency.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      agency: newAgency,
    },
  });
});

exports.updateAgency = catchAsync(async (req, res) => {
  const agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!agency) {
    return next(new AppError("Agency not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      agency,
    },
  });
});

exports.deleteAgency = catchAsync(async (req, res) => {
  const agency = await Agency.findByIdAndDelete(req.params.id);

  if (!agency) {
    return next(new AppError("Agency not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
