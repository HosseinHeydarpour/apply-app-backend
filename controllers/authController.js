const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

/**
 * تولید توکن JWT (امضا کردن).
 *
 * توکن مثل یک کارت شناسایی دیجیتال است. وقتی کاربر لاگین می‌کند،
 * این توکن را به او می‌دهیم تا در درخواست‌های بعدی نشان دهد و بگوییم "تو را می‌شناسیم".
 *
 * @param {string} id - شناسه کاربر (User ID) که قرار است داخل توکن ذخیره شود.
 * @returns {string} - رشته توکن رمزنگاری شده.
 */
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/**
 * تابع کمکی برای ساخت توکن و ارسال پاسخ نهایی به کاربر.
 *
 * هدف: جلوگیری از تکرار کد. چون هم در لاگین، هم در ثبت‌نام و هم در تغییر رمز،
 * باید یک کار مشابه انجام دهیم (توکن بسازیم و بفرستیم)، این تابع را نوشتیم.
 *
 * @param {Object} user - آبجکت کاربر.
 * @param {number} statusCode - کد وضعیت HTTP (مثلاً 200 یا 201).
 * @param {Object} res - آبجکت پاسخ.
 */
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token, // این همان کلید ورود کاربر است
    data: {
      user,
    },
  });
};

/**
 * ثبت‌نام کاربر جدید (Sign Up).
 *
 * @function signup
 * @param {Object} req - اطلاعات کاربر جدید (نام، ایمیل، رمز و...).
 * @param {Object} res - پاسخ سرور (شامل توکن).
 * @param {Function} next - مدیریت خطا.
 */
exports.signup = catchAsync(async (req, res, next) => {
  // ۱. ساخت آبجکت کاربر فقط با فیلدهای مجاز.
  // توضیح مهم برای استاد: ما مستقیماً req.body را به دیتابیس نمی‌فرستیم.
  // چرا؟ چون ممکن است هکر یک فیلد role: 'admin' بفرستد و خودش را مدیر کند.
  // پس ما دستی فیلدها را جدا می‌کنیم تا امنیت حفظ شود.
  const userData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  if (req.body.passwordChangedAt) {
    userData.passwordChangedAt = req.body.passwordChangedAt;
  }

  // ۲. ذخیره در دیتابیس.
  const newUser = await User.create(userData);

  // ۳. ارسال توکن ورود (تا کاربر بلافاصله بعد از ثبت‌نام لاگین شود).
  createAndSendToken(newUser, 201, res);
});

/**
 * ورود کاربر (Login).
 *
 * @function login
 * @param {Object} req - شامل ایمیل و رمز عبور.
 * @param {Object} res - شامل توکن JWT.
 * @param {Function} next - مدیریت خطا.
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // ۱. چک کردن اینکه آیا ایمیل و رمز ارسال شده یا نه؟
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // ۲. پیدا کردن کاربر در دیتابیس و دریافت رمز عبور (که هش شده است).
  // نکته: ما معمولاً رمز را از دیتابیس نمی‌گیریم (select: false)، اما اینجا برای مقایسه لازمش داریم.
  const user = await User.findOne({ email }).select("+password");

  // ۳. بررسی صحت رمز عبور.
  // آیا کاربری پیدا شد؟ و آیا رمز وارد شده با رمز دیتابیس یکی است؟
  // user.correctPassword یک متد سفارشی است که در مدل User نوشتیم.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // ۴. اگر همه چیز درست بود، توکن بفرست.
  createAndSendToken(user, 200, res);
});

/**
 * میدل‌ویر محافظت از روت‌ها (Protect Middleware).
 *
 * این تابع مثل "نگهبان" عمل می‌کند. قبل از اینکه کاربر به بخش‌های خصوصی (مثل پروفایل یا خرید) دسترسی پیدا کند،
 * این تابع اجرا می‌شود تا مطمئن شویم کاربر لاگین کرده و توکن معتبر دارد.
 *
 * @function protect
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // ۱. استخراج توکن از هدر درخواست.
  // استاندارد ارسال توکن این شکلی است: "Bearer eyJhbGciOiJIUz..."
  // ما کلمه Bearer را جدا می‌کنیم و فقط کد توکن را برمی‌داریم.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // اگر توکنی نبود، اخراجش کن!
  if (!token) return next(new AppError("Please login to get access", 401));

  // ۲. اعتبارسنجی توکن (Verification).
  // بررسی می‌کنیم که توکن جعلی نباشد و تاریخ انقضایش نگذشته باشد.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // ۳. چک کردن اینکه آیا کاربری که این توکن را دارد هنوز وجود دارد؟
  // شاید کاربر دیروز توکن گرفته ولی امروز اکانتش توسط ادمین پاک شده باشد.
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belongning to this token no longer exists"),
    );
  }

  // ۴. چک کردن اینکه آیا کاربر اخیراً رمزش را عوض کرده؟
  // اگر توکن مال ۳ روز پیش باشد ولی کاربر ۱ ساعت پیش رمزش را عوض کرده باشد،
  // آن توکن قدیمی باید باطل شود.
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError("User recently changed password! Please log in again!", 401),
    );

  // ۵. دسترسی مجاز است. اطلاعات کاربر را به درخواست می‌چسبانیم تا توابع بعدی استفاده کنند.
  req.user = currentUser;

  next();
});

/**
 * درخواست فراموشی رمز عبور (Forgot Password).
 *
 * کاربر ایمیلش را می‌زند و ما یک لینک ریست برایش ایمیل می‌کنیم.
 *
 * @function forgotPassword
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // ۱. پیدا کردن کاربر با ایمیل.
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // ۲. تولید توکن تصادفی برای ریست پسورد.
  // این متد (createPasswordResetToken) را در مدل User نوشتیم.
  const resetToken = user.createPasswordResetToken();
  // ذخیره کردن توکن در دیتابیس (بدون اعتبارسنجی‌های معمول).
  await user.save({ validateBeforeSave: false });

  // ۳. ساخت لینک ریست و ارسال ایمیل.
  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    // اگر ارسال ایمیل شکست خورد، توکن ذخیره شده در دیتابیس را پاک کن تا مشکلی پیش نیاید.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500,
      ),
    );
  }
});

/**
 * تنظیم رمز عبور جدید (Reset Password).
 *
 * کاربر روی لینک ایمیل کلیک کرده و حالا رمز جدید را وارد می‌کند.
 *
 * @function resetPassword
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  // ۱. دریافت توکن از URL و هش کردن آن (چون در دیتابیس به صورت هش شده ذخیره کردیم).
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // پیدا کردن کاربری که این توکن را دارد و هنوز توکنش منقضی نشده.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // ۲. اگر توکن نامعتبر یا منقضی بود:
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // ۳. تنظیم رمز جدید.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // پاک کردن فیلدهای مربوط به ریست (چون عملیات تمام شد).
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // ذخیره در دیتابیس.
  await user.save();

  // ۴. ورود خودکار کاربر و ارسال توکن JWT جدید.
  createAndSendToken(user, 200, res);
});

/**
 * تغییر رمز عبور توسط کاربر لاگین شده (Update Password).
 *
 * فرقش با Reset این است که اینجا کاربر رمز قبلی‌اش را می‌داند و لاگین است.
 *
 * @function updatePassword
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  // ۱. دریافت اطلاعات کاربر فعلی (که قبلاً توسط میدل‌ویر protect در req.user گذاشته شده).
  // باید رمز عبور را هم بگیریم تا چک کنیم.
  const user = await User.findById(req.user.id).select("+password");

  // ۲. چک کردن اینکه آیا رمز فعلی (Current Password) درست وارد شده؟
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // ۳. اگر درست بود، رمز جدید را ست کن.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // ذخیره با user.save() تا میدل‌ویرهای مربوط به رمزنگاری (Hashing) در مدل User اجرا شوند.
  await user.save();

  // ۴. ارسال توکن جدید (چون وقتی رمز عوض می‌شود، توکن قبلی از اعتبار ساقط می‌شود).
  createAndSendToken(user, 200, res);
});
