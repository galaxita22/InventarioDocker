// src/middlewares/localLlmErrorHandler.js

export const llmErrorAnalyzer = async (err, req, res, next) => {
  // 1. Respondes al cliente para no bloquear el sistema
  res.status(500).json({ 
    success: false, 
    message: "Error interno. El LLM está analizando el fallo." 
  });

  // 2. Envías el error al LLM local
  try {
    const prompt = `Analiza este error en Node.js y dime por qué falló en una sola frase breve. Error: ${err.message}`;

    const response = await fetch('http://llm-server:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b', // El modelo exacto que descargaste
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();

    // 3. Registras la respuesta del LLM
    console.log("🤖 [Análisis del LLM Local]:", data.response);
    
  } catch (llmError) {
    console.error("Fallo la conexión con el contenedor del LLM:", llmError.message);
  }
};