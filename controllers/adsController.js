const Ad = require("../model/adModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllAds = catchAsync(async (req, res) => {
  const features = new APIFeatures(Ad.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const ads = await features.query;

  res.status(200).json({
    status: "success",
    results: ads.length,
    data: {
      ads,
    },
  });
});
