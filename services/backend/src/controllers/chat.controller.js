// src/controllers/chat.controller.js
import { Activo, Solicitud, Establecimiento } from '../models/index.js';

export const responderChatIA = async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: "El mensaje es obligatorio" });
    }

    
    const totalActivos = await Activo.count();
    const totalSolicitudes = await Solicitud.count();
    const totalEstablecimientos = await Establecimiento.count();

    
    const systemPrompt = `
      Eres el asistente virtual oficial del sistema de inventario y activos del SLEP.
      Tu objetivo es ayudar a los usuarios (docentes o administrativos) a resolver dudas sobre el sistema.
      
      Estado actual de la base de datos:
      - Activos registrados: ${totalActivos}
      - Solicitudes registradas: ${totalSolicitudes}
      - Establecimientos asociados: ${totalEstablecimientos}

      Reglas de negocio:
      - Solo los usuarios con rol de Aprobador Director pueden aprobar solicitudes de activos.
      - Si te preguntan algo fuera del sistema de inventario, di amablemente que solo puedes ayudar con temas del SLEP.
      - Sé breve, directo y profesional en tus respuestas.
    `;

    const response = await fetch('http://llm-server:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: `${systemPrompt}\n\nPregunta del usuario: "${mensaje}"`,
        stream: false
      })
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      respuesta: data.response
    });

  } catch (error) {
    console.error("Error en el chat de IA:", error);
    return res.status(500).json({ error: "El servidor de IA no está disponible en este momento." });
  }
};