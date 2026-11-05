import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Permiso = sequelize.define('Permiso', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  modulo: {
    type: DataTypes.STRING,
    allowNull: false, // Ej: 'inventario', 'solicitudes', 'usuarios'
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false, // Ej: 'leer', 'crear', 'editar', 'eliminar', 'aprobar'
  },
  descripcion_visual: {
    type: DataTypes.STRING,
    allowNull: false, // Ej: 'Aprobar o rechazar solicitudes' (Lo que leerá el usuario en React)
  }
}, {
  tableName: 'permisos',
  timestamps: false, // Los permisos son estáticos en la lógica del sistema, no necesitan fechas
});

export default Permiso;