const express = require("express");
const app = express();
const fs = require("fs");

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log("Hello From Middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const agencies = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/agencies.json`),
);

const getAllAgencies = (req, res) => {
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

const getAgency = (req, res) => {
  const id = req.params.id * 1;
  const agency = agencies.find((agency) => agency.id === id);
  if (!agency) {
    return res.status(404).json({
      status: "error",
      message: "Agency not found",
    });
  }
  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: {
      agency,
    },
  });
};

const createAgency = (req, res) => {
  const newId = agencies[agencies.length - 1].id + 1;
  const newAgency = Object.assign({ id: newId }, req.body);
  agencies.push(newAgency);

  fs.writeFileSync(
    `${__dirname}/dev-data/data/agencies.json`,
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

const updateAgency = (req, res) => {
  const id = req.params.id * 1;
  if (id > agencies.length) {
    return res.status(404).json({
      status: "error",
      message: "Agency not found",
    });
  }
  // Update agency logic here
  res.status(200).json({
    status: "success",
    data: {
      agency: agencies[id - 1],
    },
  });
};

const deleteAgency = (req, res) => {
  const id = req.params.id * 1;
  if (id > agencies.length) {
    return res.status(404).json({
      status: "error",
      message: "Agency not found",
    });
  }
  // Delete agency logic here
  res.status(204).json({
    status: "success",
    data: null,
  });
};

app.route("/api/v1/agencies").get(getAllAgencies).post(createAgency);

app.use((req, res, next) => {
  console.log("Hello From Middleware before getAgency");
  next();
});

app
  .route("/api/v1/agencies/:id")
  .get(getAgency)
  .patch(updateAgency)
  .delete(deleteAgency);

app.use((req, res, next) => {
  console.log("Hello From Middleware after getAgency");
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
