const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path"); // 1. Import the path module
const multer = require("multer");
const express = require("express");

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

// 1. CONFIGURATION: Where and how to save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files to the 'public/images' folder
    // Make sure this folder exists!
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    // Rename the file to avoid conflicts (e.g., user-123-timestamp.jpg)
    // We append the current timestamp to the original name
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize the upload middleware with the storage configuration
const upload = multer({ storage: storage });

// 2. SERVING: Make the 'public' folder accessible
// If you save a file as '123.jpg' in 'public/images',
// it will be accessible at: http://localhost:3000/images/123.jpg
app.use(express.static("public"));

// 3. SAVING: Route to handle the image upload
// 'image' is the name of the input field in your frontend form
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Send back the URL where the image can be accessed
  res.json({
    message: "Image uploaded successfully!",
    imageUrl: `http://localhost:3000/images/${req.file.filename}`,
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err);
  server.close(() => process.exit(1));
});
