const mongoose = require("mongoose");
const validator = require("validator"); // کتابخانه‌ای برای چک کردن صحت ایمیل و غیره
const bcrypt = require("bcryptjs"); // کتابخانه‌ای برای رمزنگاری پسورد
const crypto = require("crypto"); // کتابخانه داخلی نود برای تولید رشته‌های تصادفی امن

/**
 * @description
 * اسکیمای کاربر (User Schema).
 * تمام اطلاعات هویتی، امنیتی و درخواست‌های کاربر در اینجا مدیریت می‌شود.
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      require: [true, "Email is required"],
      unique: true, // ایمیل نباید تکراری باشد
      trim: true,
      lowercase: true, // تبدیل خودکار به حروف کوچک
      // استفاده از validator برای اطمینان از اینکه فرمت ایمیل صحیح است (مثلا @ دارد)
      validator: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      unique: true, // شماره تلفن یکتا (کلید اصلی لاگین)
      trim: true,
      maxlength: [20, "Phone cannot be more than 20 characters"],
    },

    /**
     * رمز عبور.
     * select: false یعنی وقتی لیست کاربران را می‌گیریم، پسورد (حتی هش شده) برای امنیت بیشتر ارسال نشود.
     */
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    /**
     * تکرار رمز عبور.
     * فقط برای اعتبارسنجی اولیه است و در دیتابیس ذخیره نخواهد شد (در ادامه حذف می‌شود).
     */
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // این تابع چک می‌کند که آیا تکرار رمز با اصل رمز برابر است یا خیر
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },

    passwordChangedAt: Date, // تاریخی که آخرین بار پسورد عوض شده
    profileImage: { type: String, trim: true },

    /**
     * مدارک کاربر (Documents).
     * آرایه‌ای از آبجکت‌هاست که هر کدام یک نوع مدرک و آدرس فایل را نگه می‌دارند.
     */
    documents: [
      {
        title: String,
        docType: {
          type: String,
          // enum: فقط مقادیر داخل آرایه values قابل قبول هستند. اگر چیز دیگری بیاید خطا می‌دهد.
          enum: {
            values: ["passport", "scoreList", "cv", "other"],
            message:
              "Document type must be one of: passport, scoreList, cv, other",
          },
          required: false,
        },
        fileUrl: { type: String, required: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    createdAt: { type: Date, default: Date.now, select: false },

    // فیلدهای مربوط به فراموشی رمز عبور
    passwordResetToken: String,
    passwordResetExpires: Date,

    // لیست درخواست‌های اپلای کاربر به دانشگاه‌ها
    applications: [
      {
        university: { type: mongoose.Schema.Types.ObjectId, ref: "University" }, // ارجاع به مدل دانشگاه
        status: {
          type: String,
          enum: {
            values: ["pending", "reviewing", "accepted", "rejected"], // وضعیت‌های مجاز اپلای
            message:
              "Status must be one of: pending, reviewing, accepted, rejected",
          },
          default: "pending",
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],

    // لیست مشاوره‌های رزرو شده
    consultations: [
      {
        consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" }, // ارجاع به مدل موسسه (Agency)
        status: {
          type: String,
          enum: {
            values: ["pending", "scheduled", "completed", "cancelled"],
            message:
              "Status must be one of: pending, scheduled, completed, cancelled",
          },
          default: "pending",
        },
        scheduledAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * @description
 * یک فیلد مجازی (Virtual) برای نام کامل.
 * این فیلد در دیتابیس ذخیره نمی‌شود، بلکه هر وقت کاربر را فراخوانی کنیم، ترکیب نام و نام خانوادگی را برمی‌گرداند.
 */
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * @middleware Pre-save Hook (Hashing Password)
 * قبل از ذخیره کاربر، اگر پسورد تغییر کرده باشد، آن را هش (رمزنگاری) می‌کند.
 */
userSchema.pre("save", async function (next) {
  // اگر پسورد تغییر نکرده (مثلا کاربر فقط ایمیلش را آپدیت کرده)، از این مرحله رد شو
  if (!this.isModified("password")) return next();

  // رمزنگاری پسورد با هزینه پردازشی 12 (امنیت بالا)
  this.password = await bcrypt.hash(this.password, 12);

  // فیلد تکرار پسورد دیگر نیاز نیست در دیتابیس بماند، پس حذف می‌شود
  this.passwordConfirm = undefined;

  next();
});

/**
 * @middleware Pre-save Hook (Password Change Timestamp)
 * اگر پسورد تغییر کرده باشد، فیلد passwordChangedAt را آپدیت می‌کند.
 */
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // 1000 میلی‌ثانیه (1 ثانیه) کم می‌کنیم تا مطمئن شویم توکن JWT که ساخته می‌شود بعد از این تاریخ باشد.
  // این کار برای جلوگیری از مشکلات همزمانی سرور است.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 * @method correctPassword
 * یک متد اختصاصی برای مدل کاربر.
 * وظیفه: مقایسه پسوردی که کاربر وارد کرده با پسورد هش شده در دیتابیس.
 * @param {string} candidatePassword - پسوردی که کاربر موقع لاگین وارد کرده
 * @param {string} userPassword - پسورد هش شده ذخیره شده در دیتابیس
 * @returns {boolean} - آیا پسورد صحیح است؟
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * @method changedPasswordAfter
 * چک می‌کند که آیا کاربر بعد از صدور توکن (Login)، رمز خود را عوض کرده است یا خیر.
 * اگر عوض کرده باشد، توکن قبلی باید بی اعتبار شود.
 * @param {number} JWTTimestamp - زمانی که توکن صادر شده است
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    console.log(changedTimeStamp, JWTTimestamp);

    // اگر زمان تغییر پسورد بزرگتر از زمان صدور توکن باشد، یعنی پسورد عوض شده است.
    return JWTTimestamp < changedTimeStamp;
  }

  // اگر تغییری ثبت نشده باشد، یعنی پسورد عوض نشده (False)
  return false;
};

/**
 * @method createPasswordResetToken
 * ایجاد یک توکن تصادفی برای ریست کردن پسورد (فراموشی رمز عبور).
 * توکن را هش کرده و در دیتابیس ذخیره می‌کند، اما نسخه خام را به کاربر ایمیل می‌زند.
 * @returns {string} - توکن خام برای ارسال به ایمیل کاربر
 */
userSchema.methods.createPasswordResetToken = function () {
  // 1. تولید یک رشته تصادفی 32 بایتی و تبدیل به hex
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. هش کردن توکن برای ذخیره امن در دیتابیس
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. تعیین زمان انقضا (10 دقیقه بعد از الان)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // توکن خام (هش نشده) را برمی‌گرداند تا به ایمیل کاربر ارسال شود
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
