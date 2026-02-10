const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logoUrl: { type: String, trim: true },
  description: { type: String, trim: true },
  contactInfo: { type: String, trim: true }, // یا آبجکت شامل تلفن و ایمیل

  // ارتباط با دانشگاه‌ها (این موسسه کدام دانشگاه‌ها را ساپورت می‌کند)
  supportedUniversities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
  ],
  createdAt: { type: Date, default: Date.now, select: false },
});

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
