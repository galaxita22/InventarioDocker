import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Activo from './Activo.js';
import Account from './Account.js';
import Ubicacion from './Ubicacion.js';

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigo_solicitud: { // El nuevo campo rescatado de tu lógica antigua
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tipo_operacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'pendiente', 'devuelta', 'aprobada', 'rechazada'),
    defaultValue: 'borrador',
    allowNull: false,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ubicacion_destino_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Es null porque una "baja" no requiere destino
  }
}, {
  tableName: 'solicitudes',
  timestamps: true,
});

// Relaciones con el Activo
Activo.hasMany(Solicitud, { foreignKey: 'activo_id' });
Solicitud.belongsTo(Activo, { foreignKey: 'activo_id' });

// Relaciones con los Usuarios (Segregación de funciones)
Account.hasMany(Solicitud, { as: 'Solicitadas', foreignKey: 'solicitante_id' });
Solicitud.belongsTo(Account, { as: 'Solicitante', foreignKey: 'solicitante_id' });

Account.hasMany(Solicitud, { as: 'Aprobadas', foreignKey: 'aprobador_id' });
Solicitud.belongsTo(Account, { as: 'Aprobador', foreignKey: 'aprobador_id' });

Ubicacion.hasMany(Solicitud, { foreignKey: 'ubicacion_destino_id' });
Solicitud.belongsTo(Ubicacion, { as: 'UbicacionDestino', foreignKey: 'ubicacion_destino_id' });

export default Solicitud;