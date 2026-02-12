/**
 * @module adRoutes
 * @description
 * این فایل مسئول مدیریت مسیرهای (URLهای) مربوط به "تبلیغات" است.
 * وقتی کاربری آدرسی مرتبط با تبلیغات را درخواست می‌کند، این فایل تصمیم می‌گیرد چه اتفاقی بیفتد.
 */

const express = require("express");

// ساخت یک شیء Router جدید برای تعریف مسیرهای فرعی
const router = express.Router();

// وارد کردن فایل کنترل‌کننده که منطق اصلی (مثل گرفتن داده از دیتابیس) در آنجا نوشته شده است
const adController = require("../controllers/adsController");

/**
 * @route   GET /api/v1/ads/
 * @desc    دریافت لیست تمام تبلیغات
 * @access  Public (عمومی)
 */
router
  .route("/")
  // متد get یعنی کاربر فقط می‌خواهد اطلاعات را بخواند (Read)
  // وقتی درخواستی به ریشه (/) بیاید، تابع getAllAds از کنترلر اجرا می‌شود
  .get(adController.getAllAds);

// خروجی دادن این روتر برای استفاده در فایل اصلی برنامه (app.js)
module.exports = router;
