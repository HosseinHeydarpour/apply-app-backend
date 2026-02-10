const mongoose = require("mongoose");

const validator = require("validator");

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
      unique: true,
      trim: true,
      lowercase: true,
      validator: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [20, "Phone cannot be more than 20 characters"],
    }, // کلید اصلی برای لاگین
    password: { type: String, required: [true, "Password is required"] }, // حتما هش شده ذخیره شود
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
    },
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
