import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

// Rutas de la nueva arquitectura SLEP
import accountRoutes from "./src/routes/account.routes.js";
import establecimientoRoutes from './src/routes/establecimiento.routes.js';
import ubicacionRoutes from './src/routes/ubicacion.routes.js';
import activoRoutes from './src/routes/activo.routes.js';
import solicitudRoutes from './src/routes/solicitud.routes.js';

const app = express();

const allowedOrigins = [
  'http://34.176.181.10:8080'      // IP interna de slep-erp-server
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 1. Permite peticiones sin origen (same-origin policy del navegador)
    if (!origin) return callback(null, true);

    // 2. Valida estrictamente contra la lista blanca
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Bloqueo estricto con registro de auditoría
    console.error(`[SEGURIDAD] CORS Bloqueado. Origen recibido: '${origin}'`);
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true 
}));
app.use(express.json());

const uploadDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

// Endpoints oficiales del SLEP
app.use("/api/accounts", accountRoutes);
app.use('/api/establecimientos', establecimientoRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/activos', activoRoutes); // ¡Te faltaba activar esta línea!
app.use('/api/solicitudes', solicitudRoutes);

app.use((error, _req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "El archivo no puede superar 5 MB" });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

export default app;
