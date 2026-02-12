const nodemailer = require("nodemailer");

/**
 * تابع sendEmail
 * هدف: ارسال ایمیل به کاربر (مثلاً برای فراموشی رمز عبور).
 *
 * @param {Object} options - شامل اطلاعات ایمیل (گیرنده، موضوع، متن).
 */
const sendEmail = async (options) => {
  // ۱) ایجاد یک Transporter (حمل‌کننده)
  // این بخش مثل تنظیمات "اداره پست" است. مشخص می‌کنیم از چه سرویسی (مثل Gmail یا سرویس شخصی) استفاده می‌کنیم.
  // اطلاعات حساس مثل رمز عبور از فایل تنظیمات (process.env) خوانده می‌شوند تا امنیت حفظ شود.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // آدرس سرور ایمیل
    port: process.env.EMAIL_PORT, // پورت سرور
    secure: false, // آیا از SSL استفاده شود؟ (معمولا برای پورت 587 فالس است)
    auth: {
      user: process.env.EMAIL_USERNAME, // نام کاربری ایمیل
      pass: process.env.EMAIL_PASSWORD, // رمز عبور ایمیل
    },
  });

  // ۲) تعریف گزینه‌های ایمیل (Mail Options)
  // مشخص کردن فرستنده، گیرنده، موضوع و متن پیام.
  const mailOptions = {
    from: "Pazireshino <hello@pazireshino.com>", // ایمیل فرستنده
    to: options.email, // ایمیل گیرنده (از ورودی تابع می‌آید)
    subject: options.subject, // موضوع ایمیل
    text: options.message, // متن اصلی ایمیل
  };

  // ۳) ارسال نهایی ایمیل
  // این عملیات زمان‌بر است، پس از await استفاده می‌کنیم تا برنامه منتظر بماند تا ایمیل ارسال شود.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
