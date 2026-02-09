const fs = require("fs");

const agencies = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/agencies.json`),
);

exports.checkID = (req, res, next, val) => {
  if (val > agencies.length) {
    return res.status(404).json({
      status: "error",
      message: "Invalid ID",
    });
  }
  next();
};

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
  console.log(req.requestTime);
  res.status(200).json({
    status: "success",
    results: agencies.length,
    requestTime: req.requestTime,
    data: {
      agencies,
    },
  });
};

exports.getAgency = (req, res) => {
  const id = req.params.id * 1;
  const agency = agencies.find((agency) => agency.id === id);

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: {
      agency,
    },
  });
};

exports.createAgency = (req, res) => {
  const newId = agencies[agencies.length - 1].id + 1;
  const newAgency = Object.assign({ id: newId }, req.body);
  agencies.push(newAgency);

  fs.writeFile(
    `${__dirname}/../dev-data/data/agencies.json`,
    JSON.stringify(agencies),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Failed to write file",
        });
      }
      res.status(201).json({
        status: "success",
        data: {
          agency: newAgency,
        },
      });
    },
  );
};

exports.updateAgency = (req, res) => {
  const id = req.params.id * 1;

  // Update agency logic here
  res.status(200).json({
    status: "success",
    data: {
      agency: agencies[id - 1],
    },
  });
};

exports.deleteAgency = (req, res) => {
  const id = req.params.id * 1;

  // Delete agency logic here
  res.status(204).json({
    status: "success",
    data: null,
  });
};
