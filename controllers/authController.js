const User = require("../model/userModel");

const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");

const jwt = require("jsonwebtoken");

exports.signup = catchAsync(async (req, res, next) => {
  // 1. Create the user object with only the allowed fields
  // (This prevents users from manually setting roles like 'admin')
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // 2. Send response
  // Ideally, remove the password from the response output
  newUser.password = undefined;

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token: token,
    data: {
      user: newUser,
    },
  });
});
