const express = require("express");
const app = express();
const fs = require("fs");
const morgan = require("morgan");

// Middleware
app.use(express.json());

// OPTIONS: "dev" | "combined" | "short" | "tiny"
app.use(morgan("dev"));

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

// User Routes
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`),
);

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not implemented yet",
  });
};

// Agency routes

const agencyRoute = express.Router();

app.use("/api/v1/agencies", agencyRoute);

agencyRoute.route("/").get(getAllAgencies).post(createAgency);
agencyRoute
  .route("/:id")
  .get(getAgency)
  .patch(updateAgency)
  .delete(deleteAgency);

// User routes
const userRoute = express.Router();

app.use("/api/v1/users", userRoute);

userRoute.route("/").get(getAllUsers).post(createUser);
userRoute.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
