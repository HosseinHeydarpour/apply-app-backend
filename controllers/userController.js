const fs = require("fs");

// User Routes
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`),
);

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};
