const mongoose = require("mongoose");

const validator = require("validator");

const bcrypt = require("bcryptjs");

const crypto = require("crypto");
const { title } = require("process");

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

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    }, // حتما هش شده ذخیره شود
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: Date,
    profileImage: { type: String, trim: true }, // آدرس تصویر پروفایل

    // مدارک به صورت آرایه ذخیره می‌شوند تا قابلیت گسترش داشته باشد
    documents: [
      {
        docType: {
          title: String,
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

    passwordResetToken: String,
    passwordResetExpires: Date,
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Set passwordChangedAt to 1 second before the current time
  // This ensures the token issued just before password change won't be valid
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    console.log(changedTimeStamp, JWTTimestamp);

    return JWTTimestamp < changedTimeStamp; // 100 < 200
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
