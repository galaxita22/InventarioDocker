import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Activo from './Activo.js';

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_original: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url_archivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_mime: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'documentos',
  timestamps: true,
});

export default Documento;
