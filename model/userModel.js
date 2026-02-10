const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [20, "Phone cannot be more than 20 characters"],
    }, // کلید اصلی برای لاگین
    password: { type: String, required: true }, // حتما هش شده ذخیره شود
    profileImage: { type: String, trim: true }, // آدرس تصویر پروفایل

    // مدارک به صورت آرایه ذخیره می‌شوند تا قابلیت گسترش داشته باشد
    documents: [
      {
        docType: {
          type: String,
          enum: {
            values: ["passport", "scoreList", "cv", "other"], // انواع مجاز
            message:
              "Document type must be one of: passport, scoreList, cv, other",
          },
          required: false,
        },
        fileUrl: { type: String, required: false }, // آدرس فایل آپلود شده
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    createdAt: { type: Date, default: Date.now, select: false },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// make full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
