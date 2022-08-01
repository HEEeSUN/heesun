import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";

const __dirname = path.resolve();
const uploadImgDir = path.join(__dirname, "..", "/temp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadImgDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uploadImgName =
      path.basename(file.originalname, ext) + Date.now() + ext;
    cb(null, uploadImgName);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const resize = async (req, res, next) => {
  if (!req.file) {
    return next();
  } else {
    try {
      const resizedImgDir = path.join(
        __dirname,
        "..",
        `/public/image/${req.file.filename}`
      );
      const metadata = await sharp(req.file.path).metadata();
      const requiredWidth = 500;
      const requiredHeight = 600;
      let imageFile;

      if (
        metadata.width <= requiredWidth ||
        metadata.height <= requiredHeight
      ) {
        imageFile = sharp(req.file.path).resize({
          width: 500,
          height: 600,
          withoutEnlargement: true,
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        }); // 비율을 유지하며 가로 크기 줄이기
      } else {
        imageFile = sharp(req.file.path).resize({ width: 500, height: 600 });
      }

      imageFile.withMetadata().toBuffer((err, buffer) => {
        if (err) throw err;
        fs.writeFile(resizedImgDir, buffer, () => {
          fs.rm(req.file.path, () => {
            next();
          });
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
