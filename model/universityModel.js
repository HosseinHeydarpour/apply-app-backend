const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Country cannot be more than 100 characters"],
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, "City cannot be more than 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  logoUrl: {
    type: String,
    trim: true,
    maxlength: [200, "Logo URL cannot be more than 200 characters"],
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, "Website cannot be more than 200 characters"],
  },
  // مثلا رنکینگ یا فیلدهای اضافه
  rating: {
    type: Number,
    min: [0, "Rating cannot be less than 0"],
    max: [5, "Rating cannot be more than 5"],
  },
});

const University = mongoose.model("University", universitySchema);

module.exports = University;
