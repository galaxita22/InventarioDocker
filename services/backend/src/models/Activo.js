import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Ubicacion from './Ubicacion.js';

const Activo = sequelize.define('Activo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigo_patrimonial: {
    // Exigido por el RF006: Identificación por código único (QR o Barras)
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado_conservacion: {
    // Requisito 4.2.8: nuevo, bueno, regular, malo, obsoleto
    type: DataTypes.STRING,
    allowNull: true,
  },
  valor: {
    // Requisito 4.2.2: Valorización del activo
    type: DataTypes.INTEGER, 
    allowNull: true,
  }
}, {
  tableName: 'activos',
  timestamps: true, // Vital para auditoría de cuándo se ingresó al sistema
});

// Relación 1:N (Una Ubicación tiene muchos Activos)
Ubicacion.hasMany(Activo, { foreignKey: 'ubicacion_id' });
Activo.belongsTo(Ubicacion, { foreignKey: 'ubicacion_id' });

export default Activo;