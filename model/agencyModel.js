const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const agencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    contactInfo: { type: String, trim: true }, // یا آبجکت شامل تلفن و ایمیل
    slug: { type: String, trim: true },
    // ارتباط با دانشگاه‌ها (این موسسه کدام دانشگاه‌ها را ساپورت می‌کند)
    supportedUniversities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
      },
    ],
    createdAt: { type: Date, default: Date.now, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// agencySchema.virtual("universities", {
//   ref: "University",
//   localField: "supportedUniversities",
//   foreignField: "_id",
// });

// Generate slug from name before saving
agencySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

agencySchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this._startTime} milliseconds`);
  next();
});

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
