import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, "_")
            .slice(0, 50);

        callback(null, `${Date.now()}-${safeName}${extension}`);
    }
});

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

const uploadComponentImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(new Error("Solo se permiten imágenes JPG, PNG, WEBP o GIF"));
        }

        callback(null, true);
    }
});

export default uploadComponentImage;