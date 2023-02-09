import { Storage } from "@google-cloud/storage";
import multer from "multer";
import config from '../../config.js'

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
});


const storage = new Storage();
const bucket = storage.bucket(config.gcp.bucketName);

export const gcpUpload = async (req, res) => {
  console.log('image file is uploading...');
  const {uploadImgName} = req
  const blob = bucket.file(uploadImgName);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', err => {
    console.log(err)
    return res.sendStatus(400)
  });

  blobStream.on('finish', () => {
    res.sendStatus(201);
  });

  blobStream.end(req.file.buffer);

}

