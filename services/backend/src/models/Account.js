import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Rol from './Rol.js';

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
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permite null por si alguien se registra y aún no se le asigna rol
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
Account.belongsTo(Rol, { foreignKey: 'rol_id', as: 'NivelAcceso' });
Rol.hasMany(Account, { foreignKey: 'rol_id', as: 'Usuarios' });
export default Account;