/**
 * کلاس AppError
 * هدف: مدیریت استاندارد و یکپارچه خطاها در کل برنامه.
 * این کلاس از کلاس اصلی Error جاوااسکریپت ارث‌بری می‌کند.
 *
 * @extends Error
 */
class AppError extends Error {
  /**
   * @param {string} message - پیام خطایی که به کاربر نمایش داده می‌شود.
   * @param {number} statusCode - کد وضعیت HTTP (مثل 404 یا 500).
   */
  constructor(message, statusCode) {
    // فراخوانی سازنده کلاس والد (Error) برای تنظیم پیام خطا
    super(message);

    this.statusCode = statusCode;

    // تعیین وضعیت بر اساس کد:
    // اگر کد با 4 شروع شود (مثل 404) یعنی "fail" (خطای کاربر).
    // در غیر این صورت "error" (خطای سرور).
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // مشخص می‌کند که این خطا پیش‌بینی شده و عملیاتی است (نه یک باگ ناشناخته در کد).
    // این به ما کمک می‌کند تا خطاهای برنامه‌نویسی را از خطاهای کاربری تفکیک کنیم.
    this.isOperational = true;

    // ثبت ردپای خطا (Stack Trace) برای دیباگ کردن، بدون اینکه سازنده این کلاس در آن دیده شود.
    // یعنی نشان می‌دهد خطا دقیقاً کجای کد اصلی رخ داده است.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
