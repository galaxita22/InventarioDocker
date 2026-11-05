import { Rol, Permiso } from '../models/index.js';

export const obtenerRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll({
            // Incluimos los permisos asociados a cada rol
            include: [{ 
                model: Permiso, 
                as: 'Permisos',
                through: { attributes: [] } // Oculta los datos extra de la tabla pivote
            }]
        });
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al obtener roles" });
    }
};

export const obtenerPermisos = async (req, res) => {
    try {
        const permisos = await Permiso.findAll();
        res.status(200).json(permisos);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al obtener permisos" });
    }
};

export const actualizarPermisosRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { permisosIds } = req.body; // Esperamos un arreglo de IDs: [1, 2, 5]

        const rol = await Rol.findByPk(id);
        if (!rol) return res.status(404).json({ message: "Rol no encontrado" });

        // El método mágico setPermisos reemplaza todos los interruptores del rol
        await rol.setPermisos(permisosIds);

        res.status(200).json({ message: "Permisos actualizados con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al actualizar permisos" });
    }
};