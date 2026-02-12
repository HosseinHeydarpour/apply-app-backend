/**
 * @fileoverview اسکریپت بارگذاری و حذف داده‌ها (Data Seeder Script)
 * این فایل برای مدیریت داده‌های اولیه در پایگاه داده استفاده می‌شود.
 * با استفاده از این اسکریپت می‌توانیم داده‌های تستی را وارد یا پاک کنیم.
 */

// فراخوانی کتابخانه‌های مورد نیاز
// mongoose: ابزاری برای ارتباط ساده‌تر با پایگاه داده MongoDB
const mongoose = require("mongoose");
// dotenv: برای خواندن تنظیمات محرمانه (مثل رمز دیتابیس) از فایل config.env
const dotenv = require("dotenv");
// fs: (File System) ماژول داخلی نود.جی‌اس برای خواندن و نوشتن فایل‌ها
const fs = require("fs");
// Tour: مدل (شکل و ساختار) داده‌های ما که در فایل دیگری تعریف شده است
const Tour = require("../../model/adModel");

// تنظیم فایل پیکربندی
// این خط باعث می‌شود به متغیرهای داخل فایل config.env دسترسی داشته باشیم
dotenv.config({
  path: "./config.env",
});

// آماده‌سازی آدرس اتصال به دیتابیس
// رمز عبور واقعی را جایگزین کلمه <PASSWORD> در آدرس دیتابیس می‌کنیم
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

// برقراری اتصال به پایگاه داده (Database Connection)
mongoose
  .connect(DB, {
    // این تنظیمات برای جلوگیری از هشدارهای قدیمی بودن (Deprecation Warnings) است
    // استاد: "این‌ها تنظیمات استاندارد برای نسخه‌های جدید Mongoose هستند."
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => console.log("DB connection Successful")); // اگر اتصال موفق بود، این پیام چاپ می‌شود

/**
 * خواندن فایل اطلاعات (JSON)
 * `fs.readFileSync`: فایل را به صورت همگام (Sync) می‌خواند (برنامه صبر می‌کند تا فایل خوانده شود)
 * `JSON.parse`: متن داخل فایل را به آبجکت‌های جاوا‌اسکریپت تبدیل می‌کند تا قابل استفاده باشد
 */
const ads = JSON.parse(fs.readFileSync(`${__dirname}/ads.json`, "utf-8"));

/**
 * وارد کردن داده‌ها به دیتابیس
 * تمام داده‌های موجود در فایل JSON را در دیتابیس ذخیره می‌کند.
 *
 * @async
 * @function importData
 * @returns {Promise<void>} خروجی ندارد، فقط عملیات را انجام می‌دهد و برنامه بسته می‌شود.
 */
const importData = async () => {
  try {
    // Tour.create: متدی از Mongoose که آرایه‌ای از داده‌ها را می‌گیرد و در دیتابیس می‌سازد
    // await: صبر می‌کنیم تا عملیات ذخیره‌سازی در دیتابیس تمام شود
    await Tour.create(ads);
    console.log("Data successfully loaded!");
  } catch (error) {
    // اگر خطایی رخ داد (مثلاً دیتابیس قطع بود)، خطا را چاپ کن
    console.log(error);
  }
  // پس از اتمام کار، اجرای برنامه را متوقف کن (برای جلوگیری از باز ماندن اتصال)
  process.exit();
};

/**
 * حذف تمام داده‌ها از دیتابیس
 * برای پاکسازی دیتابیس قبل از تست‌های جدید استفاده می‌شود.
 *
 * @async
 * @function deleteData
 * @returns {Promise<void>} خروجی ندارد، داده‌ها حذف شده و برنامه بسته می‌شود.
 */
const deleteData = async () => {
  try {
    // Tour.deleteMany({}): وقتی داخل پرانتز خالی باشد، یعنی "همه چیز" را انتخاب و حذف کن
    await Tour.deleteMany({});
    console.log("Data successfully deleted!");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// کنترل ورودی‌های خط فرمان (Command Line Arguments)
// process.argv: آرایه‌ای است که کلماتی که در ترمینال تایپ شده را نگه می‌دارد.
// مثال: اگر بنویسیم `node seed.js --import`
// process.argv[2] برابر با `--import` خواهد بود.

if (process.argv[2] === "--import") {
  // اگر کاربر دستور --import را زد، تابع وارد کردن را اجرا کن
  importData();
} else if (process.argv[2] === "--delete") {
  // اگر کاربر دستور --delete را زد، تابع حذف کردن را اجرا کن
  deleteData();
}
