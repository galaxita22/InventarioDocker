import { Establecimiento } from '../models/index.js';

export const crearEstablecimiento = async (req, res) => {
    try {
        const { rbd, nombre, direccion, tipo } = req.body;
        
        const nuevoEstablecimiento = await Establecimiento.create({
            rbd,
            nombre,
            direccion,
            tipo
        });

        res.status(201).json({
            mensaje: "Establecimiento creado con éxito",
            datos: nuevoEstablecimiento
        });
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al crear el establecimiento", 
            error: error.message 
        });
    }
};

export const obtenerEstablecimientos = async (req, res) => {
    try {
        const establecimientos = await Establecimiento.findAll();
        res.status(200).json(establecimientos);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al obtener los establecimientos", 
            error: error.message 
        });
    }
};