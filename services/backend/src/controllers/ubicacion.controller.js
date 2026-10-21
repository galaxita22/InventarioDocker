import { Ubicacion, Establecimiento } from '../models/index.js';

export const crearUbicacion = async (req, res) => {
    try {
        const { nombre, dependencia, centro_costo, establecimiento_id } = req.body;
        
        // Validación: verificar que el colegio realmente exista en la BD
        const establecimientoExiste = await Establecimiento.findByPk(establecimiento_id);
        if (!establecimientoExiste) {
            return res.status(404).json({ mensaje: "El establecimiento no existe" });
        }

        const nuevaUbicacion = await Ubicacion.create({
            nombre,
            dependencia,
            centro_costo,
            establecimiento_id
        });

        res.status(201).json({
            mensaje: "Ubicación creada con éxito",
            datos: nuevaUbicacion
        });
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al crear la ubicación", 
            error: error.message 
        });
    }
};

export const obtenerUbicaciones = async (req, res) => {
    try {
        // Al consultar, traemos los datos de la ubicación y el nombre de su colegio (JOIN)
        const ubicaciones = await Ubicacion.findAll({
            include: [{ model: Establecimiento, attributes: ['nombre', 'rbd'] }]
        });
        res.status(200).json(ubicaciones);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al obtener las ubicaciones", 
            error: error.message 
        });
    }
};