import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const Establecimiento = sequelize.define('Establecimiento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rbd: {
    // Rol Base de Datos: Identificador único del MINEDUC para colegios
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comuna: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo: {
    // Ej: Liceo, Escuela Básica, Jardín Infantil
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'establecimientos',
  timestamps: true, // Crea automáticamente createdAt y updatedAt
});

export default Establecimiento;