const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  imageUrl: { type: String, required: true, trim: true }, // عکس بنر
  targetUrl: { type: String, trim: true }, // لینکی که کاربر با کلیک به آن هدایت می‌شود
  isActive: { type: Boolean, default: true }, // برای فعال/غیرفعال کردن نمایش
  expirationDate: { type: Date }, // تاریخ انقضای تبلیغ
});

const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
