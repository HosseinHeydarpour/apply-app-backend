/**
 * کلاس APIFeatures
 * هدف: مدیریت پیشرفته درخواست‌های دیتابیس.
 * این کلاس به ما اجازه می‌دهد کارهایی مثل فیلتر کردن، مرتب‌سازی، محدود کردن فیلدها و صفحه‌بندی را به راحتی انجام دهیم.
 *
 * @class
 */
class APIFeatures {
  /**
   * ساخت نمونه جدید از APIFeatures
   * @param {Object} query - کوئری اصلی دیتابیس (همان دستوری که هنوز اجرا نشده).
   * @param {Object} queryString - پارامترهایی که کاربر در آدرس URL فرستاده (مثل ?sort=price&page=2).
   */
  constructor(query, queryString) {
    this.query = query; // دستور دیتابیس
    this.queryString = queryString; // اطلاعات ارسالی کاربر از طریق URL
  }

  /**
   * متد فیلتر کردن (Filter)
   * وظیفه: حذف پارامترهای اضافی و آماده‌سازی دستورات شرطی (مثل بزرگتر/کوچکتر).
   * @returns {APIFeatures} - خود کلاس را برمی‌گرداند تا بتوانیم متدهای دیگر را زنجیره‌وار صدا بزنیم.
   */
  filter() {
    // ۱. تهیه یک کپی از اطلاعات ارسالی کاربر تا اطلاعات اصلی خراب نشود.
    const queryObj = { ...this.queryString };

    // ۲. تعریف کلماتی که مربوط به فیلتر کردن داده‌ها نیستند و باید از لیست شرط‌ها حذف شوند.
    // (مثلاً page مربوط به شماره صفحه است، نه نام یک ستون در دیتابیس).
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]); // حذف این کلمات از لیست شرط‌ها

    // ۳. تبدیل آبجکت به رشته متنی برای انجام عملیات جایگزینی پیشرفته
    let queryStr = JSON.stringify(queryObj);

    // ۴. اضافه کردن علامت دلار ($) به دستورات شرطی
    // دیتابیس (MongoDB) دستورات را با $ می‌شناسد (مثل $gte برای بزرگتر مساوی).
    // این خط کلمات gte, gt, lte, lt را پیدا کرده و به $gte و... تبدیل می‌کند.
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // ۵. تبدیل دوباره رشته به آبجکت و اعمال آن روی کوئری دیتابیس
    this.query = this.query.find(JSON.parse(queryStr));

    // ۶. برگرداندن "this" (خود کلاس) برای اینکه بتوانیم بلافاصله بعد از این، متد sort را صدا بزنیم.
    return this;
  }

  /**
   * متد مرتب‌سازی (Sort)
   * وظیفه: مرتب کردن نتایج بر اساس فیلد خاص (مثلاً قیمت یا تاریخ).
   * @returns {APIFeatures}
   */
  sort() {
    if (this.queryString.sort) {
      // اگر کاربر درخواست مرتب‌سازی داشت:
      // علامت کاما (,) را با فاصله جایگزین می‌کنیم چون دیتابیس با فاصله کار می‌کند.
      // مثال: "price,age" تبدیل می‌شود به "price age"
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // حالت پیش‌فرض: اگر کاربر چیزی نگفت، جدیدترین‌ها اول نمایش داده شوند.
      // علامت منفی (-) یعنی ترتیب نزولی (از جدید به قدیم).
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  /**
   * متد محدودسازی فیلدها (Limit Fields)
   * وظیفه: انتخاب اینکه کدام ستون‌های دیتابیس به کاربر نمایش داده شود (برای کاهش حجم داده).
   * @returns {APIFeatures}
   */
  limitFields() {
    if (this.queryString.fields) {
      // اگر کاربر فیلدهای خاصی را خواست:
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields); // فقط این فیلدها را انتخاب کن
    } else {
      // حالت پیش‌فرض: همه چیز را برگردان بجز فیلد "__v"
      // (این فیلد داخلی خود دیتابیس است و کاربر نیازی به دیدن آن ندارد).
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * متد صفحه‌بندی (Paginate)
   * وظیفه: نمایش داده‌ها به صورت صفحه‌به‌صفحه (مثلاً ۱۰ محصول در هر صفحه).
   * @returns {APIFeatures}
   */
  paginate() {
    // تبدیل ورودی به عدد. اگر عددی نبود، پیش‌فرض ۱ در نظر بگیر.
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    // محاسبه مقدار پرش (Skip):
    // اگر صفحه ۲ را بخواهیم و هر صفحه ۱۰ آیتم باشد، باید ۱۰ آیتم اول (صفحه ۱) را رد کنیم (Skip).
    // فرمول: (شماره صفحه - ۱) * تعداد در هر صفحه
    const skip = (page - 1) * limit;

    // اعمال دستورات روی کوئری:
    // skip: این تعداد را رد کن.
    // limit: فقط این تعداد را برگردان.
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
