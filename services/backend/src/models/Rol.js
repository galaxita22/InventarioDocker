import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ej: 'Administrador', 'Aprobador'
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#64748b', // Gris por defecto si no se especifica
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'roles',
  timestamps: true,
});

export default Rol;