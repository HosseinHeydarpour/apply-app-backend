/**
 * @module userRoutes
 * @description
 * این فایل قلب سیستم مدیریت کاربران است.
 * شامل دو بخش اصلی است:
 * 1. احراز هویت (ثبت‌نام، ورود، فراموشی رمز)
 * 2. مدیریت پروفایل کاربر (آپدیت عکس، تغییر رمز، آپلود مدارک)
 */

const express = require("express");
const router = express.Router();

// کنترلر مربوط به اطلاعات کاربر (پروفایل، عکس و...)
const userController = require("../controllers/userController");

// کنترلر مربوط به امنیت (لاگین، ساین‌آپ، چک کردن توکن)
const authController = require("../controllers/authController");

// --- بخش احراز هویت (Authentication) ---

/**
 * @route   POST /signup
 * @desc    ثبت‌نام کاربر جدید در سایت
 */
router.route("/signup").post(authController.signup);

/**
 * @route   POST /login
 * @desc    ورود کاربر و دریافت توکن (JWT)
 */
router.route("/login").post(authController.login);

/**
 * @route   POST /forgotPassword
 * @desc    ارسال ایمیل بازیابی رمز عبور (وقتی کاربر رمز را فراموش کرده)
 */
router.route("/forgotPassword").post(authController.forgotPassword);

/**
 * @route   PATCH /resetPassword/:token
 * @desc    تنظیم رمز عبور جدید با استفاده از توکنی که ایمیل شده بود
 */
router.route("/resetPassword/:token").patch(authController.resetPassword);

// --- بخش‌های محافظت شده (نیاز به لاگین دارند) ---

/**
 * @middleware authController.protect
 * نکته مهم: در خطوط زیر، تابع protect مثل "نگهبان" عمل می‌کند.
 * اجازه نمی‌دهد کسی بدون لاگین کردن (داشتن توکن معتبر) به این مسیرها دسترسی داشته باشد.
 */

/**
 * @route   PATCH /updateMyPassword
 * @desc    تغییر رمز عبور توسط خود کاربر (وقتی لاگین است)
 */
router.patch(
  "/updateMyPassword",
  authController.protect, // اول: چک کن کاربر لاگین باشد
  userController.uploadUserPhoto, // (احتمالا اشتباه تایپی در کد اصلی، اما اینجا آپلود عکس صدا زده شده)
  authController.updatePassword, // سوم: رمز را عوض کن
);

// route for updating user data
// مسیر برای آپدیت اطلاعات معمولی کاربر (مثل نام و ایمیل)
router.patch("/updateMe", authController.protect, userController.updateMe);

/**
 * @route   POST /upload-document
 * @desc    آپلود مدارک تحصیلی یا هویتی
 * @flow
 * 1. protect: چک کردن لاگین
 * 2. uploadDocumentMiddleware: تنظیمات مولتر (Multer) برای دریافت فایل
 * 3. uploadDocument: ذخیره فایل در سرور و دیتابیس
 */
router
  .route("/upload-document")
  .post(
    authController.protect,
    userController.uploadDocumentMiddleware,
    userController.uploadDocument,
  );

// درخواست اپلای برای دانشگاه
router.post("/apply", authController.protect, userController.applyToUniversity);

// درخواست مشاوره
router.post(
  "/consultation",
  authController.protect,
  userController.requestConsultation,
);

// مشاهده تاریخچه فعالیت‌های کاربر
router.get("/history", authController.protect, userController.getUserHistory);

/**
 * @route   GET / (Root for users)
 * @desc    دریافت لیست همه کاربران (معمولاً برای پنل ادمین)
 */
router.route("/").get(authController.protect, userController.getAllUsers);

/**
 * @route   GET /:id
 * @desc    دریافت اطلاعات یک کاربر خاص با ID
 */
router.route("/:id").get(authController.protect, userController.getUser);

module.exports = router;
