import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '@/utils/app-error';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup storage
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // Tentukan folder otomatis berdasarkan endpoint URL
    let entityType = 'GENERAL';
    const url = req.originalUrl || req.baseUrl;
    if (url.includes('/rooms')) entityType = 'ROOM';
    else if (url.includes('/kosts')) entityType = 'KOST';
    else if (url.includes('/facilities')) entityType = 'FACILITY';

    const dynamicUploadDir = path.join(process.cwd(), 'public', 'uploads', entityType);
    
    if (!fs.existsSync(dynamicUploadDir)) {
      fs.mkdirSync(dynamicUploadDir, { recursive: true });
    }
    cb(null, dynamicUploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

// File filter for images and videos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'images' || file.fieldname === 'thumbnail') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Format gambar tidak didukung! Hanya menerima JPEG, PNG, dan WEBP.', 400));
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Format video tidak didukung! Hanya menerima MP4, WEBM, dan MOV.', 400));
    }
  } else {
    cb(new AppError('Format file tidak didukung atau field upload salah.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit untuk mengakomodasi video
  },
});

export const parseFormDataJson = (req: any, res: any, next: any) => {
  if (req.body && req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({ status: 400, message: 'Format JSON pada field "data" tidak valid!' });
    }
  }
  next();
};
