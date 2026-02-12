const AppError = require("../utils/appError");

/**
 * مدیریت خطای CastError (فرمت نامعتبر داده‌ها).
 *
 * مثال: وقتی در آدرس URL به جای یک ID استاندارد، یک متن الکی وارد شود.
 * دیتابیس ارور CastError می‌دهد و ما اینجا آن را به یک پیام ساده برای کاربر تبدیل می‌کنیم.
 *
 * @param {Object} err - خطای خام دیتابیس.
 * @returns {AppError} - خطای استاندارد شده و قابل فهم.
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  // کد 400 یعنی "درخواست بد" (Bad Request).
  return new AppError(message, 400);
};

/**
 * مدیریت خطای DuplicateFields (داده تکراری).
 *
 * مثال: وقتی کاربر می‌خواهد با ایمیلی ثبت‌نام کند که قبلاً در سیستم وجود دارد.
 * ارور کد 11000 مونگو دی‌بی رخ می‌دهد.
 *
 * @param {Object} err - خطای خام دیتابیس.
 * @returns {AppError} - خطای استاندارد شده.
 */
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}`;
  return new AppError(message, 400);
};

/**
 * مدیریت خطای ValidationError (اعتبارسنجی).
 *
 * مثال: رمز عبور کوتاه است، یا فیلد اجباری خالی مانده.
 *
 * @param {Object} err - خطای خام دیتابیس (شامل لیستی از خطاها).
 * @returns {AppError} - تمام پیام‌های خطا را به هم می‌چسباند.
 */
const handleValidationErrorDB = (err) => {
  // استخراج پیام‌های خطا از داخل آبجکت پیچیده ارور و تبدیل به یک رشته متن.
  const message = Object.values(err.errors).map((el) => el.message);
  return new AppError(message, 400);
};

/**
 * مدیریت خطای نامعتبر بودن توکن (JWT Error).
 * وقتی امضای توکن دستکاری شده باشد.
 */
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

/**
 * مدیریت خطای انقضای توکن (Token Expired).
 * وقتی تاریخ مصرف توکن گذشته باشد.
 */
const handleJWTExpiredError = () =>
  new AppError("Invalid token. Please log in again!", 401);

/**
 * ارسال خطا در محیط توسعه (Development).
 *
 * در این حالت، ما "همه چیز" را به برنامه‌نویس نشان می‌دهیم (Stack Trace)
 * تا بتواند باگ را پیدا و رفع کند.
 *
 * @param {Object} err - خطا.
 * @param {Object} res - پاسخ.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    messasge: err.message,
    stack: err.stack, // مسیر دقیق فایل و خطی که ارور داده (فقط برای برنامه‌نویس).
  });
};

/**
 * ارسال خطا در محیط محصول (Production).
 *
 * در این حالت، ما فقط پیام‌های ساده و تمیز را به کاربر نشان می‌دهیم.
 * جزئیات فنی و باگ‌ها را مخفی می‌کنیم تا هکرها سوءاستفاده نکنند.
 *
 * @param {Object} err - خطا.
 * @param {Object} res - پاسخ.
 */
const sendErrorProd = (err, res) => {
  // الف) خطاهای قابل پیش‌بینی (Operational).
  // مثل: رمز عبور اشتباه، ایمیل تکراری و...
  // این‌ها خطاهایی هستند که ما با AppError ساختیم و خاصیت isOperational دارند.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // ب) خطاهای برنامه‌نویسی یا ناشناخته (Programming Errors).
    // مثل: باگ در کد، قطع شدن دیتابیس و...
    // نباید جزئیات فنی را به کاربر عادی نشان دهیم.
  } else {
    // ۱. لاگ کردن خطا در کنسول سرور (تا خودمان ببینیم چی شده).
    // console.error('ERROR 💥', err);

    // ۲. ارسال یک پیام عمومی به کاربر.
    res.status(err.statusCode).json({
      status: "error",
      message: "Something went wrong", // پیام کلی و مبهم.
    });
  }
};

/**
 * میدل‌ویر اصلی مدیریت خطا (Global Error Handler Middleware).
 *
 * اکسپرس (Express) این تابع را به خاطر داشتن ۴ ورودی (err, req, res, next)
 * به عنوان تابع مدیریت خطا می‌شناسد.
 */
module.exports = (err, req, res, next) => {
  // تنظیم مقادیر پیش‌فرض اگر وجود نداشته باشند (معمولا 500 یعنی خطای سرور).
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // انشعاب مسیر بر اساس محیط اجرا (Environment).

  if (process.env.NODE_ENV === "development") {
    // اگر در حال توسعه هستیم، همه جزئیات را نشان بده.
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // اگر سایت نهایی است، خطاها را مدیریت شده نشان بده.

    // کپی کردن خطا برای دستکاری (چون نباید آبجکت اصلی err را تغییر دهیم).
    let error = { ...err };

    // نکته مهم: در جاوا اسکریپت گاهی با کپی کردن (...) بعضی فیلدهای خاص مثل message کپی نمی‌شوند.
    // پس دستی آن‌ها را اضافه می‌کنیم.
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;
    error.errors = err.errors;
    error._message = err._message;

    // تشخیص نوع خطا و تبدیل آن به خطای استاندارد (AppError).
    // ۱. خطای فرمت ID (مثل CastError).
    if (error.name === "CastError") error = handleCastErrorDB(error);
    // ۲. خطای داده تکراری (کد 11000 در مونگو).
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // ۳. خطای اعتبارسنجی (Validation).
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    // ۴. خطای توکن (دستکاری شده).
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    // ۵. خطای توکن (منقضی شده).
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    // ارسال پاسخ نهایی.
    sendErrorProd(error, res);
  }
};
