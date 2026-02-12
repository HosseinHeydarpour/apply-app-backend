const multer = require("multer"); // کتابخانه مدیریت آپلود فایل
const path = require("path");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// --- 1. تنظیمات آپلود فایل (MULTER CONFIGURATION) ---

/**
 * تنظیمات محل ذخیره‌سازی فایل‌ها.
 *
 * Multer نیاز دارد بداند فایل را کجا ذخیره کند و چه نامی برایش بگذارد.
 * ما از diskStorage استفاده می‌کنیم تا فایل را روی هارد دیسک سرور ذخیره کنیم.
 */
const multerStorage = multer.diskStorage({
  // ۱. تعیین پوشه مقصد (Destination).
  destination: (req, file, cb) => {
    // cb (Callback) مثل دکمه تایید است. ورودی اول خطا (که نداریم null) و ورودی دوم آدرس پوشه است.
    cb(null, "public/images"); // پوشه‌ای که عکس‌ها آنجا می‌روند.
  },
  // ۲. تعیین نام فایل (Filename).
  filename: (req, file, cb) => {
    // هدف: ساخت یک نام یکتا تا اگر دو کاربر عکسی با نام me.jpg آپلود کردند، روی هم بازنویسی نشود.
    // فرمت نام: user-شناسه_کاربر-زمان_فعلی.پسوند
    // مثال: user-65a2b3c-1702345678.jpeg
    const ext = path.extname(file.originalname); // پسوند فایل اصلی (مثلا .jpg) را می‌گیرد.
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

/**
 * فیلتر کردن فایل‌ها (فقط عکس مجاز است).
 *
 * این تابع بررسی می‌کند فایلی که کاربر فرستاده واقعاً عکس است یا خیر.
 */
const multerFilter = (req, file, cb) => {
  // mimetype نوع فایل را نشان می‌دهد (مثلا image/jpeg یا image/png).
  if (file.mimetype.startsWith("image")) {
    cb(null, true); // تایید است.
  } else {
    // اگر عکس نبود، ارور می‌دهیم.
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// راه‌اندازی نهایی Multer با تنظیماتی که بالا ساختیم.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/**
 * میدل‌ویر آپلود عکس پروفایل.
 * این تابع یک فایل با نام فیلد 'image' را از فرم دریافت و پردازش می‌کند.
 */
exports.uploadUserPhoto = upload.single("image");

// --- توابع کمکی (HELPER FUNCTIONS) ---

/**
 * فیلتر کردن آبجکت ورودی.
 *
 * هدف: امنیت. فرض کنید کاربر بخواهد فیلد role: 'admin' را در آپدیت پروفایل بفرستد.
 * ما با این تابع فقط اجازه‌ی عبور فیلدهای مجاز (مثل نام و ایمیل) را می‌دهیم.
 *
 * @param {Object} obj - آبجکت حاوی تمام اطلاعات ارسالی کاربر (req.body).
 * @param {...string} allowedFields - لیست فیلدهایی که مجاز هستند (مثل 'name', 'email').
 * @returns {Object} - آبجکت جدید که فقط فیلدهای مجاز را دارد.
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// --- هندلرها (HANDLERS) ---

/**
 * دریافت لیست تمام کاربران.
 *
 * @function getAllUsers
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

/**
 * دریافت اطلاعات یک کاربر خاص با ID.
 *
 * @function getUser
 */
exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

/**
 * بروزرسانی اطلاعات شخصی کاربر (Update Me).
 *
 * کاربر لاگین شده می‌تواند نام، ایمیل و عکس پروفایل خود را تغییر دهد.
 * نکته: رمز عبور اینجا عوض نمی‌شود.
 *
 * @function updateMe
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // ۱. اگر کاربر سعی کرد رمز عبور را اینجا بفرستد، خطا بده.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400,
      ),
    );
  }

  // ۲. فیلتر کردن بدنه درخواست.
  // فقط اجازه می‌دهیم نام، ایمیل و تلفن آپدیت شوند.
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "phone",
  );

  // ۳. بررسی آپلود عکس.
  // اگر Multer فایلی را پردازش کرده باشد، اطلاعاتش در req.file موجود است.
  if (req.file) {
    // نام فایل ذخیره شده را به دیتابیس اضافه می‌کنیم.
    filteredBody.profileImage = req.file.filename;
  }

  // ۴. آپدیت کردن داکیومنت کاربر در دیتابیس.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // نسخه جدید را برگردان
    runValidators: true, // اعتبارسنجی کن (مثلا فرمت ایمیل درست باشد)
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

/**
 * میدل‌ویر برای آپلود فایل داکیومنت (مثل رزومه یا پاسپورت).
 * نام فیلد در فرم باید 'document' باشد.
 */
exports.uploadDocumentMiddleware = upload.single("document");

/**
 * ذخیره اطلاعات داکیومنت آپلود شده در پروفایل کاربر.
 *
 * @function uploadDocument
 */
exports.uploadDocument = catchAsync(async (req, res, next) => {
  // الف) چک کردن اینکه آیا فایلی آپلود شده است؟
  if (!req.file) {
    return next(new AppError("No file uploaded. Please select a file.", 400));
  }

  // ب) اعتبارسنجی نوع داکیومنت.
  const allowedTypes = ["passport", "scoreList", "cv", "other"];
  const { docType, title } = req.body;

  if (!docType || !allowedTypes.includes(docType)) {
    return next(
      new AppError(
        `Invalid document type. Must be one of: ${allowedTypes.join(", ")}`,
        400,
      ),
    );
  }

  // ج) اگر نوع فایل "سایر" (other) است، حتما باید عنوان داشته باشد.
  if (docType === "other" && !title) {
    return next(new AppError("Please provide a title for this document.", 400));
  }

  // د) ساختن آبجکت داکیومنت برای ذخیره در آرایه.
  const newDocument = {
    docType: docType,
    title: title || docType, // اگر عنوان خاصی نداد، همان نوع فایل را عنوان قرار بده.
    fileUrl: req.file.filename, // نام فایل روی سرور.
    uploadedAt: Date.now(),
  };

  // هـ) آپدیت دیتابیس (استفاده از $push).
  // $push یک دستور مونگو دی‌بی است که آیتم جدید را به انتهای آرایه 'documents' اضافه می‌کند.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: { documents: newDocument },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    message: "Document uploaded successfully",
    data: {
      newDocument,
      user: updatedUser,
    },
  });
});

// --- هندلرهای درخواست و مشاوره ---

/**
 * ثبت درخواست اپلای برای یک دانشگاه.
 *
 * @function applyToUniversity
 */
exports.applyToUniversity = catchAsync(async (req, res, next) => {
  const { universityId } = req.body;

  // ۱. چک کردن وجود ID دانشگاه.
  if (!universityId) {
    return next(new AppError("Please provide a university ID.", 400));
  }

  // ۲. دریافت اطلاعات کاربر برای چک کردن تکراری نبودن.
  const user = await User.findById(req.user.id);

  // ۳. چک کردن اینکه آیا قبلا برای این دانشگاه درخواست داده یا نه؟
  const existingApplication = user.applications.find(
    (app) => app.university.toString() === universityId,
  );

  if (existingApplication) {
    return next(
      new AppError("You have already applied to this university.", 400),
    );
  }

  // ۴. اضافه کردن درخواست جدید به آرایه applications.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: {
        applications: {
          university: universityId,
          status: "pending", // وضعیت پیش‌فرض: در انتظار بررسی.
          appliedAt: Date.now(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("applications.university"); // برای اینکه در پاسخ، اطلاعات کامل دانشگاه هم بیاید.

  res.status(200).json({
    status: "success",
    message: "Application submitted successfully",
    data: {
      applications: updatedUser.applications,
    },
  });
});

/**
 * ثبت درخواست مشاوره از یک آژانس.
 *
 * @function requestConsultation
 */
exports.requestConsultation = catchAsync(async (req, res, next) => {
  const { agencyId, scheduledAt } = req.body;

  if (!agencyId) {
    return next(new AppError("Please provide an Agency ID.", 400));
  }

  // اضافه کردن درخواست مشاوره به لیست مشاوره‌های کاربر.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: {
        consultations: {
          consultant: agencyId,
          status: "pending",
          scheduledAt: scheduledAt || Date.now(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // دریافت آخرین مشاوره اضافه شده برای نمایش به کاربر.
  const newConsultation =
    updatedUser.consultations[updatedUser.consultations.length - 1];

  res.status(200).json({
    status: "success",
    message: "Consultation requested successfully",
    data: {
      consultation: newConsultation,
    },
  });
});

/**
 * دریافت تاریخچه فعالیت‌های کاربر (درخواست‌ها و مشاوره‌ها).
 *
 * این تابع به جای اینکه فقط ID دانشگاه را نشان دهد، اطلاعات کامل آن را بارگذاری می‌کند.
 *
 * @function getUserHistory
 */
exports.getUserHistory = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("applications.university") // <--- جایگزینی ID دانشگاه با اطلاعات کامل آن
    .populate("consultations.consultant"); // <--- جایگزینی ID آژانس با اطلاعات کامل آن

  res.status(200).json({
    status: "success",
    data: {
      applications: user.applications,
      consultations: user.consultations,
    },
  });
});
