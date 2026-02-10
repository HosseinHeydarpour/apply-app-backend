const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // کلید اصلی برای لاگین
  password: { type: String, required: true }, // حتما هش شده ذخیره شود

  // مدارک به صورت آرایه ذخیره می‌شوند تا قابلیت گسترش داشته باشد
  documents: [
    {
      docType: {
        type: String,
        enum: ["passport", "transcript", "cv", "other"], // انواع مجاز
        required: false,
      },
      fileUrl: { type: String, required: false }, // آدرس فایل آپلود شده
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
