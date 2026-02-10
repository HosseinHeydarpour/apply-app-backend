const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },

    subject: { type: String, trim: true }, // موضوع مشاوره
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    }, // متن درخواست کاربر

    status: {
      type: String,
      enum: {
        values: ["pending", "scheduled", "done", "canceled"],
        message: "Status must be one of: pending, scheduled, done, canceled",
      },
      default: "pending",
    },
  },
  { timestamps: true },
);

const Consultation = mongoose.model("Consultation", consultationSchema);

module.exports = Consultation;
