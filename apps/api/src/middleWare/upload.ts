import multer from "multer";
import ExpressError from "src/utils/expressError";

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  if (isValidType) {
    cb(null, true);
  } else {
    cb(new ExpressError("Only JPG, PNG and WebP images are allowed", 500));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(), // store in memory, upload to Cloudinary directly
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});