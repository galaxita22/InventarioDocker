import bcrypt from "bcryptjs";
import sequelize from "./src/database/connection.js";
import { Account, Establecimiento, Ubicacion, Activo, Solicitud, Rol, Permiso } from "./src/models/index.js";

const poblarBaseDeDatos = async () => {
  try {
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    await sequelize.sync();

    if (await Rol.count() > 0) {
      const [inventarioLeer] = await Permiso.findOrCreate({
        where: { modulo: 'inventario', accion: 'leer' },
        defaults: { descripcion_visual: 'Ver inventario de activos' }
      });
      const adminRole = await Rol.findOne({ where: { nombre: 'Administrador' } });
      if (adminRole) {
        await adminRole.addPermiso(inventarioLeer);
      }
      console.log("✅ Base de datos ya inicializada; se conservan los roles y permisos existentes.");
      return;
    }

    console.log("🔨 Inicializando la base de datos...");
    await sequelize.sync({ force: true });

    // --- NUEVA SECCIÓN: RBAC (ROLES Y PERMISOS) ---
    console.log("🛡️ Creando motor de permisos y roles...");
    const listaPermisos = [
        { modulo: 'usuarios', accion: 'leer', descripcion_visual: 'Ver lista del personal' },
        { modulo: 'usuarios', accion: 'editar', descripcion_visual: 'Modificar roles y accesos' },
        { modulo: 'solicitudes', accion: 'leer_todas', descripcion_visual: 'Ver solicitudes de todos los usuarios' },
        { modulo: 'solicitudes', accion: 'aprobar', descripcion_visual: 'Aprobar o rechazar solicitudes' },
        { modulo: 'inventario', accion: 'leer', descripcion_visual: 'Ver inventario de activos' },
        { modulo: 'inventario', accion: 'crear', descripcion_visual: 'Ingresar activos nuevos' },
        { modulo: 'inventario', accion: 'editar', descripcion_visual: 'Modificar ficha técnica' },
        { modulo: 'inventario', accion: 'eliminar', descripcion_visual: 'Dar de baja activos' }
    ];
    const permisosCreados = await Permiso.bulkCreate(listaPermisos);

    const rolAdmin = await Rol.create({ nombre: 'Administrador', color: '#dc2626', descripcion: 'Acceso total y control' });
    const rolAprob = await Rol.create({ nombre: 'Aprobador', color: '#4f46e5', descripcion: 'Gestión operativa' });
    const rolSol = await Rol.create({ nombre: 'Solicitante', color: '#475569', descripcion: 'Usuario estándar' });

    await rolAdmin.addPermisos(permisosCreados);
    const permisosAprobador = permisosCreados.filter(p => 
        p.modulo === 'solicitudes' || (p.modulo === 'inventario' && p.accion === 'crear')
    );
    await rolAprob.addPermisos(permisosAprobador);

    // --- SECCIÓN DE USUARIOS ---
    console.log("👤 Creando usuarios base...");
    const contrasenaHash = await bcrypt.hash('123456', 10);

    // Buscamos explícitamente los roles en la base de datos para evitar errores de referencia
    const adminRole = await Rol.findOne({ where: { nombre: 'Administrador' } });
    const aprobRole = await Rol.findOne({ where: { nombre: 'Aprobador' } });
    const solRole = await Rol.findOne({ where: { nombre: 'Solicitante' } });

    const usuariosBase = [
      {
        rut: '20008999-5',
        nombre_usuario: 'Administrador Sistema',
        email: 'admin@slep.cl',
        contrasena: contrasenaHash,
        rol_id: adminRole ? adminRole.id : 1,
        first_login: false
      },
      {
        rut: '8180530-k',
        nombre_usuario: 'Aprobador Director',
        email: 'aprobador@slep.cl',
        contrasena: contrasenaHash,
        rol_id: aprobRole ? aprobRole.id : 2,
        first_login: false
      },
      {
        rut: '19904761-2',
        nombre_usuario: 'Solicitante Docente',
        email: 'solicitante@slep.cl',
        contrasena: contrasenaHash,
        rol_id: solRole ? solRole.id : 3,
        first_login: false
      }
    ];

    for (const user of usuariosBase) {
      await Account.create(user);
    }

    // --- SECCIÓN DE ESTABLECIMIENTOS Y ACTIVOS ---
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
      { codigo_patrimonial: 'INV-2026-001', descripcion: 'Laptop Dell XPS 15', categoria: 'Hardware', estado_conservacion: 'nuevo', valor: 850000, ubicacion_id: bodega.id },
      { codigo_patrimonial: 'INV-2026-002', descripcion: 'Monitor Samsung 27"', categoria: 'Periféricos', estado_conservacion: 'bueno', valor: 150000, ubicacion_id: salaComputacion.id },
      { codigo_patrimonial: 'INV-2026-003', descripcion: 'Proyector Epson X100', categoria: 'Audiovisual', estado_conservacion: 'regular', valor: 320000, ubicacion_id: bodega.id }
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

poblarBaseDeDatos();