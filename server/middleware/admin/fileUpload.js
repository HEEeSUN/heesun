import multer from "multer";
import path from "path";
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import config from '../../config.js'

AWS.config.update({
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
  region: config.s3.region,
})
const s3 = new AWS.S3();

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.s3.bucketName,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uploadImgName =
      path.basename(file.originalname, ext) + Date.now() + ext;
      cb(null, `image/${uploadImgName}`);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
});