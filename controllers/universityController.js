const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const University = require("../model/universityModel");

exports.aliasTopUniversities = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-rating";
  next();
};

exports.getAllUniversities = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(University.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const universities = await features.query;

  res.status(200).json({
    status: "success",
    results: universities.length,
    data: {
      universities,
    },
  });
});

exports.getUniversity = catchAsync(async (req, res, next) => {
  const university = await University.findById(req.params.id);

  if (!university) {
    return next(new AppError("Agency not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      university,
    },
  });
});
