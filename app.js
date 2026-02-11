const express = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require("cors");
const morgan = require("morgan");
const agencyRoute = require("./routes/agencyRoutes");
const userRoute = require("./routes/userRoutes");
const universityRoute = require("./routes/universityRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors({ origin: "http://localhost:4200" }));

// Middleware
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// OPTIONS: "dev" | "combined" | "short" | "tiny"
app.use(morgan("dev"));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes

app.use("/api/v1/agencies", agencyRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/universities", universityRoute);

// All other routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
