import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rut: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nombre_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    // Definimos estrictamente los roles que pide el SLEP
    type: DataTypes.ENUM('solicitante', 'aprobador', 'administrador', 'supervisor'),
    defaultValue: 'solicitante',
    allowNull: false,
  },
  first_login: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  avatar_ref: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'accounts',
  timestamps: true,
});

export default Account;