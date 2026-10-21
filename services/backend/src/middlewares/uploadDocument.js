import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads", "documentos");
// Si la carpeta no existe, la crea automáticamente
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },
    filename: (_req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        callback(null, `${uniqueSuffix}-${safeName}`);
    }
});

const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const uploadDocument = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10MB por archivo
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(new Error("Solo se permiten PDFs o imágenes (JPG, PNG)"));
        }
        callback(null, true);
    }
});

export default uploadDocument;
