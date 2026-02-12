const mongoose = require("mongoose");

/**
 * @description
 * اسکیمای تبلیغات (Ad Schema).
 * این بخش نقشه یا الگوی ذخیره‌سازی داده‌های تبلیغاتی در دیتابیس است.
 * هر تبلیغ باید طبق این ساختار ذخیره شود.
 */
const adSchema = new mongoose.Schema({
  /**
   * عنوان تبلیغ.
   * trim: فضاهای خالی اضافی اول و آخر متن را حذف می‌کند.
   */
  title: { type: String, trim: true },

  /**
   * آدرس تصویر بنر تبلیغاتی.
   * required: یعنی این فیلد اجباری است و بدون آن دیتا ذخیره نمی‌شود.
   */
  imageUrl: { type: String, required: true, trim: true },

  /**
   * لینک هدف.
   * آدرسی که کاربر پس از کلیک روی تبلیغ به آنجا هدایت می‌شود.
   */
  targetUrl: { type: String, trim: true },

  /**
   * وضعیت فعال بودن تبلیغ.
   * default: true یعنی اگر مقداری ندهیم، به صورت پیش‌فرض تبلیغ فعال (true) در نظر گرفته می‌شود.
   */
  isActive: { type: Boolean, default: true },

  /**
   * تاریخ انقضای تبلیغ.
   * مشخص می‌کند این تبلیغ تا چه زمانی معتبر است.
   */
  expirationDate: { type: Date },

  /**
   * تاریخ ایجاد رکورد.
   * default: Date.now به طور خودکار زمان لحظه‌ای ساخت تبلیغ را ذخیره می‌کند.
   */
  createdAt: { type: Date, default: Date.now },
});

// تبدیل اسکیما به مدل قابل استفاده در دیتابیس با نام "Ad"
const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
