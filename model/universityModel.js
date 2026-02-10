const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  description: { type: String, trim: true },
  logoUrl: { type: String, trim: true },
  website: { type: String, trim: true },
  // مثلا رنکینگ یا فیلدهای اضافه
});

const University = mongoose.model("University", universitySchema);

module.exports = University;
