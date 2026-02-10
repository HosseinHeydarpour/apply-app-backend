const User = require("../model/userModel");

const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");

exports.signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, passwordConfirm } =
    req.body;

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  const user = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    password: password,
    passwordConfirm: passwordConfirm,
  };

  const newUser = await User.create(user);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
