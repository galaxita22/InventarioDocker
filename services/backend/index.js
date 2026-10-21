import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./src/database/connection.js";
import './src/models/index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Aquí está la magia:
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log("⋅˚₊‧ 𐙚 ‧₊˚ ⋅ Conexión a la base de datos establecida y modelos sincronizados ⋅˚₊‧ 𐙚 ‧₊˚ ⋅");
        // inicializarCron();
        app.listen(PORT, () => {
          console.log(`✩₊˚.⋆☾⋆⁺₊✧ Servidor corriendo en puerto ${PORT} ✩₊˚.⋆☾⋆⁺₊✧`);
        });
    })
    .catch((error) => {
        console.error("Error al conectar a la base de datos:", error);
    });