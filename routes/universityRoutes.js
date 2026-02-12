/**
 * @module universityRoutes
 * @description
 * سیستم مسیریابی مربوط به دانشگاه‌ها.
 * این بخش درخواست‌های مربوط به پیدا کردن دانشگاه‌های برتر یا لیست کلی را هدایت می‌کند.
 */

const express = require("express");
const router = express.Router();

const universityController = require("../controllers/universityController");

/**
 * @route   GET /top
 * @desc    نمایش دانشگاه‌های برتر
 * @middleware aliasTopUniversities
 * این تابع ابتدا پارامترهای درخواست را طوری تنظیم می‌کند که دانشگاه‌های برتر انتخاب شوند،
 * و سپس آن‌ها را نمایش می‌دهد.
 */
router
  .route("/top")
  .get(
    universityController.aliasTopUniversities,
    universityController.getAllUniversities,
  );

/**
 * @route   GET /
 * @desc    دریافت لیست تمام دانشگاه‌ها
 */
router.route("/").get(universityController.getAllUniversities);

/**
 * @route   GET /:id
 * @desc    دریافت جزئیات کامل یک دانشگاه خاص با شناسه (ID) آن
 */
router.route("/:id").get(universityController.getUniversity);

module.exports = router;
