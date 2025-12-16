import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const uploader = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/temp");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = crypto.randomUUID();

      cb(null, `${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("only allowed jpeg, jpg, png and webp formates"),
        false
      );
    }

    cb(null, true);
  };

  const limits = {
    fileSize: 2 * 1024 * 1024,
  };

  return multer({
    storage,
    fileFilter,
    limits,
  });
};

const multerErrorMiddle = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer specific error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large! Maximum allowed size is 2MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    // General error
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
  next();
};

export { uploader, multerErrorMiddle };
