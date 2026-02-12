/**
 * @file server.js
 * @description نقطه شروع (Entry Point) برنامه.
 * وظایف اصلی:
 * 1. مدیریت خطاهای پیش‌بینی نشده (Uncaught Exceptions).
 * 2. اتصال به پایگاه داده MongoDB.
 * 3. روشن کردن سرور روی پورت مشخص.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path"); // 1. Import the path module

// مدیریت خطاهای همزمان (Synchronous) که جایی گرفته نشده‌اند
// مثلا اگر جایی از کد بنویسیم console.log(x) و x تعریف نشده باشد، اینجا برنامه را امن می‌بندد
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXEPTION! Shutting down...");
  console.log(err.name, err.message);
  // خروج از برنامه با کد 1 (یعنی خروج با خطا)
  process.exit(1);
});

// 2. Use path.join with __dirname to force the correct location
// لود کردن فایل config.env که حاوی پسوردها و تنظیمات محرمانه است
// استفاده از path.join باعث می‌شود آدرس‌دهی در ویندوز و لینوکس درست کار کند
dotenv.config({
  path: path.join(__dirname, "config.env"),
});

// وارد کردن اپلیکیشن اکسپرس که در فایل app.js ساختیم
const app = require("./app");

// آماده‌سازی آدرس دیتابیس
// جایگذاری پسورد واقعی به جای <PASSWORD> در آدرس اتصال
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

/**
 * اتصال به پایگاه داده MongoDB با استفاده از کتابخانه Mongoose
 * این تنظیمات (useNewUrlParser, ...) برای سازگاری با نسخه‌های جدید مونگو‌دی‌بی است
 */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false, // Note: standard is usually false here
  })
  .then(() => console.log("DB connection Successful")); // اگر اتصال موفق بود، این پیام چاپ می‌شود

// تعیین پورت سرور (اگر در فایل env بود از آن استفاده کن، وگرنه پورت 3000)
const PORT = process.env.PORT || 3000;

// روشن کردن سرور و گوش دادن به درخواست‌ها
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * مدیریت خطاهای ناهمگام (Asynchronous) که مدیریت نشده‌اند (Unhandled Rejection)
 * مهم‌ترین مثال: اگر اتصال به دیتابیس قطع شود یا پسورد دیتابیس غلط باشد
 */
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err);
  // ابتدا سرور را محترمانه می‌بندیم (server.close) تا درخواست‌های جاری تمام شوند
  // سپس پروسه را کلاً متوقف می‌کنیم
  server.close(() => process.exit(1));
});
