import { Req, Res, Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import { v4 as uuid } from 'uuid';
import path from 'path';
import multer from 'multer';
import fnsFormat from 'date-fns/format';
import { ConfigService } from '@nestjs/config';

const getBlobName = file => {
  return (
    fnsFormat(new Date(), 'yyyy_MM_dd') +
    '-' +
    uuid() +
    path.extname(file.originalname)
  );
};

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {}
  async upload(@Req() req, @Res() res) {
    try {
      this.uploadAWS(req, res, function(err) {
        if (err) {
          console.error(err);
        }
        if (err instanceof multer.MulterError) {
          res.status(400).json({
            uploaded: false,
            error: err.message,
          });
          return;
        } else if (err) {
          res.status(500).json({
            uploaded: false,
            error: 'Unknown error',
          });
          return;
        }
        const result = {
          size: req.file.size,
          mimetype: req.file.mimetype,
          key: req.file.key,
          url: req.file.location,
        };
        res.json({
          uploaded: true,
          result,
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        uploaded: false,
        error: 'Unknown error',
      });
    }
  }

  uploadAWS = multer({
    storage: multerS3({
      s3: new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        signatureVersion: 'v4',
      }),
      bucket: process.env.BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        cb(null, getBlobName(file));
      },
    }),
    limits: {
      fileSize: Number(process.env.MAX_SIZE_UPLOAD) * 1024 * 1024,
    },
  }).single('resource');
}
