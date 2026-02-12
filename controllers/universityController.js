const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const University = require("../model/universityModel");

/**
 * میدل‌ویر (Middleware) برای فیلتر کردن ۳ دانشگاه برتر.
 *
 * این تابع یک "تنظیم‌کننده اولیه" است. قبل از اینکه لیست دانشگاه‌ها گرفته شود،
 * این تابع اجرا می‌شود و درخواست کاربر را طوری تغییر می‌دهد که فقط ۳ دانشگاه با بالاترین امتیاز را بخواهد.
 *
 * @function aliasTopUniversities
 * @param {Object} req - درخواست کاربر (که ما آن را دستکاری می‌کنیم).
 * @param {Object} res - پاسخ (اینجا استفاده نمی‌شود).
 * @param {Function} next - دستور حرکت به تابع بعدی (getAllUniversities).
 */
exports.aliasTopUniversities = (req, res, next) => {
  // ۱. محدود کردن تعداد به ۳ عدد.
  req.query.limit = "3";

  // ۲. مرتب‌سازی بر اساس امتیاز (Rating) به صورت نزولی (از زیاد به کم).
  req.query.sort = "-rating";

  // ۳. پایان کار این تابع و رفتن به تابع اصلی.
  next();
};

/**
 * دریافت لیست تمام دانشگاه‌ها (Get All Universities).
 *
 * این تابع مسئول پردازش درخواست‌هایی است که لیست دانشگاه‌ها را می‌خواهند.
 * از کلاس APIFeatures استفاده می‌کند تا قابلیت‌های جستجو، فیلتر و صفحه‌بندی را فراهم کند.
 *
 * @function getAllUniversities
 * @param {Object} req - اطلاعات درخواست (شامل فیلترها در URL).
 * @param {Object} res - ابزار ارسال پاسخ به کاربر.
 * @param {Function} next - مدیریت خطا.
 * @returns {Promise<void>} - لیست دانشگاه‌ها را به فرمت JSON برمی‌گرداند.
 */
exports.getAllUniversities = catchAsync(async (req, res, next) => {
  // ۱. ساخت کوئری هوشمند.
  // University.find(): دستور پایه برای گشتن در دیتابیس.
  // req.query: پارامترهایی که کاربر در آدرس وارد کرده.
  const features = new APIFeatures(University.find(), req.query)
    .filter() // اعمال فیلترهای ساده
    .sort() // مرتب‌سازی نتایج
    .limitFields() // انتخاب فیلدهای خاص (مثلاً فقط نام دانشگاه)
    .paginate(); // صفحه‌بندی نتایج

  // ۲. اجرای کوئری و انتظار برای دریافت داده‌ها.
  const universities = await features.query;

  // ۳. ارسال پاسخ نهایی به کاربر.
  res.status(200).json({
    status: "success",
    results: universities.length, // تعداد دانشگاه‌های پیدا شده
    data: {
      universities,
    },
  });
});

/**
 * دریافت اطلاعات یک دانشگاه خاص (Get One University).
 *
 * این تابع با استفاده از ID دانشگاه، جزئیات آن را از دیتابیس بیرون می‌کشد.
 *
 * @function getUniversity
 * @param {Object} req - درخواست کاربر (ID دانشگاه در req.params.id است).
 * @param {Object} res - پاسخ سرور.
 * @param {Function} next - برای اعلام خطای "پیدا نشد".
 * @returns {Promise<void>} - اطلاعات یک دانشگاه را برمی‌گرداند.
 */
exports.getUniversity = catchAsync(async (req, res, next) => {
  // ۱. جستجو در دیتابیس با ID.
  const university = await University.findById(req.params.id);

  // ۲. اگر دانشگاهی با این ID پیدا نشد:
  if (!university) {
    // یک خطای ۴۰۴ تولید می‌کنیم.
    // نکته: متن ارور "Agency not found" است که احتمالا کپی-پیست از فایل قبلی بوده، اما منطق درست است.
    return next(new AppError("Agency not found", 404));
  }

  // ۳. ارسال اطلاعات دانشگاه پیدا شده.
  res.status(200).json({
    status: "success",
    data: {
      university,
    },
  });
});
