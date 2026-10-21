import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Establecimiento from './Establecimiento.js';

const Ubicacion = sequelize.define('Ubicacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    // Ej: Sala de Computación 1, Bodega Central, Oficina Dirección
    type: DataTypes.STRING,
    allowNull: false,
  },
  dependencia: {
    // Exigido por el RF007 para categorizar la ubicación
    type: DataTypes.STRING,
    allowNull: true,
  },
  centro_costo: {
    // Mencionado en los requerimientos para segmentar información
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'ubicaciones',
  timestamps: false, 
});

// Relación 1:N (Un Establecimiento tiene muchas Ubicaciones)
Establecimiento.hasMany(Ubicacion, { foreignKey: 'establecimiento_id' });
Ubicacion.belongsTo(Establecimiento, { foreignKey: 'establecimiento_id' });

export default Ubicacion;