const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: true }, // عکس بنر
  targetUrl: { type: String }, // لینکی که کاربر با کلیک به آن هدایت می‌شود
  isActive: { type: Boolean, default: true }, // برای فعال/غیرفعال کردن نمایش
  expirationDate: { type: Date }, // تاریخ انقضای تبلیغ
  duration: { type: Number }, // مدت زمان نمایش تبلیغ به میلی‌ثانیه
});

const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
