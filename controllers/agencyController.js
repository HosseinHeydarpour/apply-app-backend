const Agency = require("../model/agencyModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/**
 * میدل‌ویر (Middleware) برای انتخاب ۵ آژانس برتر.
 *
 * این تابع یک "فیلتر پیش‌فرض" است. قبل از اینکه لیست آژانس‌ها گرفته شود،
 * این تابع اجرا می‌شود و درخواست کاربر را دستکاری می‌کند تا فقط ۵ تا از بهترین‌ها را نشان دهد.
 *
 * @function aliasTopAgencies
 * @param {Object} req - آبجکت درخواست. ما کوئری‌های این آبجکت را تغییر می‌دهیم.
 * @param {Object} res - آبجکت پاسخ (در این تابع استفاده نمی‌شود چون پاسخ نهایی اینجا داده نمی‌شود).
 * @param {Function} next - تابعی که اجازه می‌دهد برنامه به مرحله بعدی (یعنی getAllAgencies) برود.
 */
exports.aliasTopAgencies = (req, res, next) => {
  // ۱. محدود کردن تعداد نتایج به ۵ عدد.
  // انگار کاربر دستی در URL نوشته ?limit=5
  req.query.limit = "5";

  // ۲. مرتب‌سازی بر اساس امتیاز (Rating) از زیاد به کم.
  // علامت منفی (-) یعنی نزولی (از بیشترین ستاره به کمترین).
  req.query.sort = "-rating";

  // ۳. انتقال به تابع بعدی.
  // چون این یک میدل‌ویر است و کارش تمام نشده، باید بگوییم "برو مرحله بعد".
  next();
};

/**
 * دریافت لیست همه آژانس‌ها (با قابلیت فیلتر و صفحه‌بندی).
 *
 * @function getAllAgencies
 * @param {Object} req - درخواست کاربر (حاوی فیلترها).
 * @param {Object} res - پاسخ سرور.
 * @returns {Promise<void>} - لیست آژانس‌ها را برمی‌گرداند.
 */
exports.getAllAgencies = catchAsync(async (req, res) => {
  // ساخت کوئری هوشمند با کلاس APIFeatures (فیلتر، سورت، محدودسازی فیلدها و صفحه‌بندی)
  const features = new APIFeatures(Agency.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // انتظار برای دریافت داده‌ها از دیتابیس
  const agencies = await features.query;

  // ارسال پاسخ موفقیت‌آمیز
  res.status(200).json({
    status: "success",
    results: agencies.length, // تعداد نتایج یافت شده
    data: {
      agencies,
    },
  });
});

/**
 * دریافت اطلاعات یک آژانس خاص با استفاده از ID.
 *
 * @function getAgency
 * @param {Object} req - درخواست کاربر (ID آژانس در req.params.id قرار دارد).
 * @param {Object} res - پاسخ سرور.
 * @param {Function} next - برای ارسال خطای "پیدا نشد".
 * @returns {Promise<void>} - اطلاعات یک آژانس تکی را برمی‌گرداند.
 */
exports.getAgency = catchAsync(async (req, res, next) => {
  // ۱. جستجو در دیتابیس با استفاده از ID موجود در URL.
  // req.params.id همان قسمت متغیر آدرس است (مثلاً: /agencies/123 -> id=123)
  const agency = await Agency.findById(req.params.id);

  // ۲. چک کردن اینکه آیا آژانسی پیدا شد یا نه؟
  if (!agency) {
    // اگر پیدا نشد، یک خطای استاندارد 404 (Not Found) تولید می‌کنیم و به مدیریت خطا می‌فرستیم.
    // return باعث می‌شود بقیه کد اجرا نشود.
    return next(new AppError("Agency not found", 404));
  }

  // ۳. ارسال آژانس پیدا شده به کاربر.
  res.status(200).json({
    status: "success",
    data: {
      agency,
    },
  });
});

/**
 * ایجاد یک آژانس جدید (Create).
 *
 * @function createAgency
 * @param {Object} req - درخواست کاربر (اطلاعات آژانس جدید در req.body است).
 * @param {Object} res - پاسخ سرور.
 * @returns {Promise<void>} - آژانس ساخته شده را برمی‌گرداند.
 */
exports.createAgency = catchAsync(async (req, res) => {
  // دستور ساخت مستقیم در دیتابیس با استفاده از داده‌های ارسالی کاربر (req.body)
  const newAgency = await Agency.create(req.body);

  // ارسال پاسخ با کد 201 (Created).
  // کد 201 مخصوص زمانی است که یک منبع جدید با موفقیت ساخته شده است.
  res.status(201).json({
    status: "success",
    data: {
      agency: newAgency,
    },
  });
});

/**
 * آپدیت کردن اطلاعات یک آژانس موجود.
 *
 * @function updateAgency
 * @param {Object} req - درخواست کاربر (ID در params و اطلاعات جدید در body).
 * @param {Object} res - پاسخ سرور.
 * @param {Function} next - برای مدیریت خطای پیدا نشدن.
 * @returns {Promise<void>} - نسخه آپدیت شده آژانس را برمی‌گرداند.
 */
exports.updateAgency = catchAsync(async (req, res, next) => {
  // ۱. پیدا کردن و آپدیت کردن همزمان.
  // ورودی اول: ID آژانس.
  // ورودی دوم: اطلاعات جدید (req.body).
  // ورودی سوم: تنظیمات (Options).
  const agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // خیلی مهم: این یعنی نسخه "جدید و آپدیت شده" را برگردان (نه نسخه قدیمی را).
    runValidators: true, // یعنی دوباره چک کن که قوانین دیتابیس (مثلاً اجباری بودن اسم) رعایت شده باشد.
  });

  // ۲. اگر ID اشتباه بود و آژانسی پیدا نشد:
  if (!agency) {
    return next(new AppError("Agency not found", 404));
  }

  // ۳. ارسال نسخه آپدیت شده.
  res.status(200).json({
    status: "success",
    data: {
      agency,
    },
  });
});

/**
 * حذف یک آژانس (Delete).
 *
 * @function deleteAgency
 * @param {Object} req - درخواست کاربر (ID در params).
 * @param {Object} res - پاسخ سرور.
 * @param {Function} next - برای مدیریت خطای پیدا نشدن.
 * @returns {Promise<void>} - هیچ داده‌ای برنمی‌گرداند (فقط وضعیت موفقیت).
 */
exports.deleteAgency = catchAsync(async (req, res, next) => {
  // ۱. پیدا کردن و حذف کردن با ID.
  const agency = await Agency.findByIdAndDelete(req.params.id);

  // ۲. مدیریت حالت پیدا نشدن.
  if (!agency) {
    return next(new AppError("Agency not found", 404));
  }

  // ۳. ارسال پاسخ موفقیت‌آمیز با کد 204 (No Content).
  // کد 204 یعنی "انجام شد، ولی چیزی برای نمایش ندارم" (چون پاک شده).
  res.status(204).json({
    status: "success",
    data: null, // طبق استاندارد REST، در حذف داده‌ای برنمی‌گردانیم.
  });
});
