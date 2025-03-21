import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import type { Request } from "express";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, file: Express.Multer.File) => {
        return {
            folder: "product_images",
            format: file.mimetype.split("/")[1] || "jpg",
            public_id: `${file.originalname.split(".")[0]}-${uuidv4()}`,
            transformation: [{ width: 800, height: 600, crop: "limit" }],
        };
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
