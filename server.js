const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path"); // 1. Import the path module

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// 2. Use path.join with __dirname to force the correct location
dotenv.config({
  path: path.join(__dirname, "config.env"),
});

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false, // Note: standard is usually false here
  })
  .then(() => console.log("DB connection Successful"));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err);
  server.close(() => process.exit(1));
});
