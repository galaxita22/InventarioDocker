import bcrypt from "bcryptjs";
import sequelize from "./src/database/connection.js";
import { Account, Establecimiento, Ubicacion, Activo, Solicitud } from "./src/models/index.js";

const poblarBaseDeDatos = async () => {
  try {
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    
    console.log("🔨 Reconstruyendo la base de datos desde cero (force: true)...");
    // force: true destruye las tablas existentes y las recrea limpias con los nuevos modelos
    await sequelize.sync({ force: true });

    console.log("👤 Creando usuarios base...");
    const contrasenaHash = await bcrypt.hash('123456', 10);

    const usuariosBase = [
      {
        rut: '20008999-5',
        nombre_usuario: 'Administrador Sistema',
        email: 'admin@slep.cl',
        contrasena: contrasenaHash,
        role: 'administrador',
        first_login: false
      },
      {
        rut: '8180530-k',
        nombre_usuario: 'Aprobador Director',
        email: 'aprobador@slep.cl',
        contrasena: contrasenaHash,
        role: 'aprobador',
        first_login: false
      },
      {
        rut: '19904761-2',
        nombre_usuario: 'Solicitante Docente',
        email: 'solicitante@slep.cl',
        contrasena: contrasenaHash,
        role: 'solicitante',
        first_login: false
      }
    ];

    for (const user of usuariosBase) {
      await Account.create(user);
    }

    console.log("🏫 Creando Establecimientos y Ubicaciones...");
    const colegio = await Establecimiento.create({
      rbd: '12345-6',
      nombre: 'Liceo Bicentenario Quilicura',
      direccion: 'Av. Las Torres 123',
      tipo: 'Liceo'
    });

    const bodega = await Ubicacion.create({
      nombre: 'Bodega Central',
      dependencia: 'Administración',
      centro_costo: 'CC-001',
      establecimiento_id: colegio.id
    });

    const salaComputacion = await Ubicacion.create({
      nombre: 'Sala de Computación 1',
      dependencia: 'Pabellón A',
      centro_costo: 'CC-002',
      establecimiento_id: colegio.id
    });

    console.log("💻 Insertando Activos Fijos...");
    const activos = [
      { 
        codigo_patrimonial: 'INV-2026-001', 
        descripcion: 'Laptop Dell XPS 15', 
        categoria: 'Hardware', 
        estado_conservacion: 'nuevo', 
        valor: 850000, 
        ubicacion_id: bodega.id 
      },
      { 
        codigo_patrimonial: 'INV-2026-002', 
        descripcion: 'Monitor Samsung 27"', 
        categoria: 'Periféricos', 
        estado_conservacion: 'bueno', 
        valor: 150000, 
        ubicacion_id: salaComputacion.id 
      },
      { 
        codigo_patrimonial: 'INV-2026-003', 
        descripcion: 'Proyector Epson X100', 
        categoria: 'Audiovisual', 
        estado_conservacion: 'regular', 
        valor: 320000, 
        ubicacion_id: bodega.id 
      }
    ];

    for (const activo of activos) {
      await Activo.create(activo);
    }

    console.log("✅ ¡Base de datos poblada con éxito para el SLEP!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error al poblar la base de datos:", error);
    process.exit(1);
  }
};

// Llamada correcta a la función
poblarBaseDeDatos();
