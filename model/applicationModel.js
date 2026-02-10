const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected"],
      default: "pending",
    },

    // توضیحات کاربر هنگام ثبت درخواست
    userNote: { type: String, trim: true },

    // فیلد برای تاریخچه (History)
  },
  { timestamps: true },
); // خودش createdAt و updatedAt را می‌سازد

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
