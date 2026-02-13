/**
 * @file app.js
 * @description فایل اصلی پیکربندی اپلیکیشن اکسپرس.
 * در این فایل، میدل‌ورها (Middleware)، مسیرها (Routes) و مدیریت خطاها تنظیم می‌شوند.
 * این فایل توسط server.js فراخوانی می‌شود.
 */

const express = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require("cors");
const morgan = require("morgan");

// وارد کردن فایل‌های مربوط به مسیرها (Routes)
// این فایل‌ها مثل "منوهای فرعی" هستند که جزئیات هر بخش را مدیریت می‌کنند
const agencyRoute = require("./routes/agencyRoutes");
const userRoute = require("./routes/userRoutes");
const universityRoute = require("./routes/universityRoutes");
const adRoute = require("./routes/adRoutes");

// وارد کردن کلاس مدیریت خطای اختصاصی ما
const AppError = require("./utils/appError");
// وارد کردن کنترل‌کننده جهانی خطاها
const globalErrorHandler = require("./controllers/errorController");

// ساختن نمونه اصلی اپلیکیشن اکسپرس
const app = express();

/**
 * ------------------------------------------------------------------
 * تنظیمات اولیه و میدل‌ورها (Middlewares)
 * میدل‌ورها مثل ایستگاه‌های بازرسی هستند که درخواست‌ها قبل از رسیدن به مقصد
 * از آن‌ها عبور می‌کنند.
 * ------------------------------------------------------------------
 */

// اگر برنامه در حالت "توسعه" (development) باشد، لاگ‌های دقیق‌تری نمایش می‌دهیم
// Morgan ابزاری است که درخواست‌ها را در کنسول چاپ می‌کند (مثلاً: GET /api/v1/users 200)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// فعال‌سازی CORS برای اجازه دسترسی به فرانت‌اند (مثلاً سایت انگولار روی پورت 4200)
// این خط باعث می‌شود مرورگر جلوی درخواست‌های بین دامنه‌ای را نگیرد
const allowedOrigins = [
  "http://localhost:4200",
  "https://apply-app-front.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Optional: only if you are using cookies/sessions
  }),
);

// Middleware
// این خط به برنامه یاد می‌دهد که چطور داده‌های JSON را بخواند
// (بدیل کردن متن دریافتی از کاربر به آبجکت‌های قابل فهم برای جاوا اسکریپت)
app.use(express.json());

// تنظیم پوشه فایل‌های استاتیک (مثل عکس‌ها یا فایل‌های CSS) که مستقیماً قابل دانلود باشند
app.use(express.static(`${__dirname}/public`));

// OPTIONS: "dev" | "combined" | "short" | "tiny"
// (تکرار تنظیم morgan که بالاتر هم بود، جهت اطمینان از لاگ شدن درخواست‌ها)
app.use(morgan("dev"));

// یک میدل‌ور ساده‌ی دست‌ساز
// این تابع زمان دقیق رسیدن درخواست را به آن اضافه می‌کند
// کاربرد: اگر بخواهیم مدت زمان پردازش را اندازه بگیریم یا زمان درخواست را ثبت کنیم
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // دستور next() بسیار مهم است؛ یعنی "کار من تمام شد، برو سراغ مرحله بعدی"
  next();
});

/**
 * ------------------------------------------------------------------
 * تعریف مسیرها (Routes Mounting)
 * اینجا آدرس‌های اصلی وب‌سایت را به فایل‌های مربوطه متصل می‌کنیم.
 * ------------------------------------------------------------------
 */

// هر درخواستی که با آدرس /api/v1/agencies شروع شود، به فایل agencyRoute فرستاده می‌شود
app.use("/api/v1/agencies", agencyRoute);

// مسیر مربوط به کاربران (ثبت‌نام، ورود و...)
app.use("/api/v1/users", userRoute);

// مسیر مربوط به دانشگاه‌ها
app.use("/api/v1/universities", universityRoute);

// مسیر مربوط به آگهی‌ها
app.use("/api/v1/ads", adRoute);

/**
 * ------------------------------------------------------------------
 * مدیریت خطای صفحات پیدا نشده (404)
 * ------------------------------------------------------------------
 */
// اگر درخواست به هیچکدام از خطوط بالا نرسید (یعنی آدرس اشتباه است)، این قسمت اجرا می‌شود.
// علامت * یعنی "هر آدرسی".
app.all("*", (req, res, next) => {
  // ساخت یک خطای جدید با استفاده از کلاس AppError که خودمان ساختیم
  // عدد 404 کد استاندارد "پیدا نشد" است
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// استفاده از مدیریت‌کننده خطای جهانی
// هر جایی در برنامه خطایی پیش بیاید (next(err))، نهایتاً به این خط می‌رسد
app.use(globalErrorHandler);

// خروجی گرفتن از اپلیکیشن برای استفاده در server.js
module.exports = app;
