const express = require("express");
const app = express();

const agencyRoute = require("./routes/agencyRoutes");
const userRoute = require("./routes/userRoutes");

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

app.use(express.static(`${__dirname}/public`));

// Routes

app.use("/api/v1/agencies", agencyRoute);
app.use("/api/v1/users", userRoute);

module.exports = app;
