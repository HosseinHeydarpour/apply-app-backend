const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * @description
 * اسکیمای موسسات مهاجرتی (Agency Schema).
 * شامل اطلاعات پایه، لوگو، توضیحات و ارتباط با دانشگاه‌ها است.
 */
const agencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // آرایه در required: مقدار اول true است، مقدار دوم پیام خطایی است که اگر نام وارد نشود به کاربر نمایش داده می‌شود.
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"], // محدودیت حداکثر کاراکتر
      minlength: [2, "Name must be at least 2 characters"], // محدودیت حداقل کاراکتر
    },
    logoUrl: { type: String, trim: true },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, "Description cannot be more than 10000 characters"],
    },
    contactInfo: { type: String, trim: true }, // اطلاعات تماس (تلفن/ایمیل) به صورت رشته متنی

    /**
     * Slug: نسخه URL-friendly نام موسسه.
     * مثلا اگر نام "My Agency" باشد، اسلاگ می‌شود "my-agency".
     * این برای SEO و زیبایی لینک‌ها استفاده می‌شود.
     */
    slug: { type: String, trim: true },

    /**
     * ارتباط با دانشگاه‌ها (Relations).
     * این آرایه شامل ID دانشگاه‌هایی است که این موسسه با آن‌ها کار می‌کند.
     * ref: 'University' به دیتابیس می‌گوید این ID مربوط به مدل دانشگاه است.
     */
    supportedUniversities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
      },
    ],

    rating: { type: Number, default: 0, min: 0, max: 5 }, // امتیاز بین 0 تا 5

    // select: false یعنی وقتی اطلاعات موسسه را می‌گیریم، تاریخ ایجاد به صورت پیش‌فرض ارسال نشود (برای امنیت یا تمیزی خروجی)
    createdAt: { type: Date, default: Date.now, select: false },
  },
  {
    // این تنظیمات اجازه می‌دهد که فیلدهای مجازی (Virtuals) در خروجی JSON و Object نمایش داده شوند.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// (کد کامنت شده مربوط به فیلد مجازی است که فعلاً غیرفعال است)
// agencySchema.virtual("universities", { ... });

/**
 * @middleware Pre-save Hook
 * قبل از اینکه اطلاعات در دیتابیس ذخیره شود (save)، این تابع اجرا می‌شود.
 * وظیفه: ساختن slug از روی name.
 */
agencySchema.pre("save", function (next) {
  // this اشاره دارد به داکیومنتی که در حال ذخیره شدن است.
  // slugify نام را کوچک کرده و فاصله‌ها را با خط تیره جایگزین می‌کند.
  this.slug = slugify(this.name, { lower: true });
  next(); // دستور می‌دهد که برو مرحله بعدی (ذخیره کردن)
});

/**
 * @middleware Post-find Hook
 * بعد از اینکه هر عملیاتی که با کلمه 'find' شروع می‌شود (مثل findOne, findAll) تمام شد، اجرا می‌شود.
 * وظیفه: لاگ کردن مدت زمانی که کوئری طول کشیده است (برای دیباگ کردن سرعت).
 */
agencySchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this._startTime} milliseconds`);
  next();
});

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
