import Account from "./Account.js";
import Establecimiento from "./Establecimiento.js";
import Ubicacion from "./Ubicacion.js";
import Activo from "./Activo.js";
import Solicitud from "./Solicitud.js";
import Documento from "./Documento.js";
import Rol from "./Rol.js";
import Permiso from "./Permiso.js";
import RolPermiso from "./RolPermiso.js";

Activo.hasMany(Documento, { as: 'Documentos', foreignKey: 'activo_id' });
Documento.belongsTo(Activo, { foreignKey: 'activo_id' });

export {
    Account,
    Establecimiento,
    Ubicacion,
    Activo,
    Solicitud,
    Documento,
    Rol,
    Permiso,
    RolPermiso
};
