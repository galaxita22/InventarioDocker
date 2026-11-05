import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Rol from './Rol.js';
import Permiso from './Permiso.js';

const RolPermiso = sequelize.define('RolPermiso', {
  // Al ser una tabla de unión pura, Sequelize inyecta rol_id y permiso_id automáticamente
}, {
  tableName: 'roles_permisos',
  timestamps: false,
});

// Relación de Muchos a Muchos (N:M)
Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id', as: 'Permisos' });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id', as: 'Roles' });

export default RolPermiso;