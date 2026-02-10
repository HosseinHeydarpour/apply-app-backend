const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String },
  description: { type: String },
  logoUrl: { type: String },
  website: { type: String },
  // مثلا رنکینگ یا فیلدهای اضافه
});

const University = mongoose.model("University", universitySchema);

module.exports = University;
