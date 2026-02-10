const express = require("express");

const morgan = require("morgan");
const agencyRoute = require("./routes/agencyRoutes");
const userRoute = require("./routes/userRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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

module.exports = app;
