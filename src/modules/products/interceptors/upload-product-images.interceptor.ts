import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const UploadProductImages = () =>
  FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: './public/images/products',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new Error('Chỉ cho phép ảnh jpg/jpeg/png'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 1024 * 1024 * 2 }, // max 2MB
  });
