const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  description: { type: String },
  contactInfo: { type: String }, // یا آبجکت شامل تلفن و ایمیل

  // ارتباط با دانشگاه‌ها (این موسسه کدام دانشگاه‌ها را ساپورت می‌کند)
  supportedUniversities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
  ],
});

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
