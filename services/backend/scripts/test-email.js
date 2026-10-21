import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { enviarCorreoRegistroUsuario } from "../src/services/servicioCorreo.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDir, "../../.env") });

const to = process.env.MAIL_TO;
const tempPassword = process.env.MAIL_TEST_PASSWORD || "Temporal123!";

if (!to) {
    console.error("Falta MAIL_TO en el entorno. Ejemplo: MAIL_TO=tu_correo@dominio.com");
    process.exit(1);
}

async function main() {
    const info = await enviarCorreoRegistroUsuario({
        email: to,
        nombre_usuario: "Usuario de prueba"
    }, tempPassword);

    console.log("Correo de registro enviado");
    console.log("MessageId:", info.messageId || "sin messageId");
}

main().catch((error) => {
    console.error("Error enviando correo de registro:", error);
    process.exit(1);
});
