/**
 * @module agencyRoutes
 * @description
 * این فایل مدیریت تمام درخواست‌های مربوط به "آژانس‌های مسافرتی" را بر عهده دارد.
 * شامل نمایش لیست، ایجاد آژانس جدید، آپدیت و حذف آن‌هاست.
 */

const express = require("express");
const router = express.Router();

// کنترلری که منطق دیتابیس آژانس‌ها را دارد
const agencyController = require("../controllers/agencyController");

// const authController = require("../controllers/authController");

/**
 * @route   GET /top-agencies
 * @desc    دریافت ۵ آژانس برتر (ارزان‌ترین یا محبوب‌ترین)
 * @explanation
 * در اینجا از یک تکنیک جالب استفاده شده است:
 * 1. aliasTopAgencies: یک میان‌افزار است که قبل از گرفتن اطلاعات، درخواست را دستکاری می‌کند (مثلاً می‌گوید: "فقط ۵ تا ارزان را بده").
 * 2. getAllAgencies: سپس همان تابع معمولی لیست‌گیری اجرا می‌شود، اما این بار با فیلترهای اعمال شده.
 */
router
  .route("/top-agencies")
  .get(agencyController.aliasTopAgencies, agencyController.getAllAgencies);

/**
 * @route   Root Route (/)
 * @desc    مدیریت عملیات کلی روی لیست آژانس‌ها
 */
router
  .route("/")
  // GET: دریافت لیست همه آژانس‌ها
  .get(agencyController.getAllAgencies)
  // POST: ثبت‌نام یا ایجاد یک آژانس جدید در سیستم
  .post(agencyController.createAgency);

/**
 * @route   ID Route (/:id)
 * @desc    مدیریت عملیات روی "یک آژانس خاص"
 * @note    عبارت :id مثل یک متغیر عمل می‌کند (مثلاً agency/123).
 */
router
  .route("/:id")
  // دریافت اطلاعات یک آژانس خاص با استفاده از ID
  .get(agencyController.getAgency)
  // PATCH: ویرایش جزئی اطلاعات آژانس (مثلاً فقط تغییر نام)
  .patch(agencyController.updateAgency)
  // DELETE: حذف کامل آژانس از دیتابیس
  .delete(agencyController.deleteAgency);

module.exports = router;
