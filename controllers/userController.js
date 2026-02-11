const multer = require("multer"); // 1. Import Multer
const path = require("path");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// --- 1. MULTER CONFIGURATION ---
// Store file on disk
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Ensure this folder exists!
  },
  filename: (req, file, cb) => {
    // Generate unique filename: user-USERID-TIMESTAMP.jpeg
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

// Filter to accept only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Export the middleware to be used in your ROUTER
exports.uploadUserPhoto = upload.single("image");

// --- HELPER FUNCTION ---
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// --- HANDLERS ---

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400,
      ),
    );
  }

  // 2) Filter body
  // based on your schema, you likely use firstName/lastName, not just "name"
  // ADD 'profileImage' TO THIS LIST if you want to allow it manually,
  // but we handle it specifically below via req.file
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "phone",
  );

  // 3) CHECK IF FILE WAS UPLOADED
  // If Multer processed a file, it sits in req.file
  if (req.file) {
    filteredBody.profileImage = req.file.filename;
  }

  // 4) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.uploadDocumentMiddleware = upload.single("document");

exports.uploadDocument = catchAsync(async (req, res, next) => {
  // A. Validation: Check if file exists
  if (!req.file) {
    return next(new AppError("No file uploaded. Please select a file.", 400));
  }

  // B. Validation: Check docType and Title
  const allowedTypes = ["passport", "scoreList", "cv", "other"];

  // 1. Extract 'title' along with 'docType'
  const { docType, title } = req.body;

  if (!docType || !allowedTypes.includes(docType)) {
    return next(
      new AppError(
        `Invalid document type. Must be one of: ${allowedTypes.join(", ")}`,
        400,
      ),
    );
  }

  // 2. (Optional) Enforce title requirement for "other" types
  if (docType === "other" && !title) {
    return next(new AppError("Please provide a title for this document.", 400));
  }

  // C. Construct the New Document Object
  const newDocument = {
    docType: docType,
    // 3. Save the title.
    // If it's 'passport', title becomes 'passport' (unless frontend sends a custom one)
    // If it's 'other', it uses the title the user typed.
    title: title || docType,
    fileUrl: req.file.filename,
    uploadedAt: Date.now(),
  };

  // D. Update Database
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $push: { documents: newDocument },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // E. Send Response
  res.status(200).json({
    status: "success",
    message: "Document uploaded successfully",
    data: {
      newDocument,
      user: updatedUser,
    },
  });
});
