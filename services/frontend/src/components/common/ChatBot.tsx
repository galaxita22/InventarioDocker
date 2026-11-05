import { useState, useRef, useEffect } from 'react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [mensajes, setMensajes] = useState([
    { role: 'assistant', text: '¡Hola! Soy el asistente virtual del SLEP. ¿En qué puedo ayudarte hoy con tus activos o solicitudes?' }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim() || loading) return;

    const textoUsuario = mensaje;
    setMensaje('');
    
    setMensajes((prev) => [...prev, { role: 'user', text: textoUsuario }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoUsuario })
      });

      const data = await res.json();

      if (data.success) {
        setMensajes((prev) => [...prev, { role: 'assistant', text: data.respuesta }]);
      } else {
        setMensajes((prev) => [...prev, { role: 'assistant', text: 'Lo siento, hubo un error procesando tu consulta.' }]);
      }
    } catch (error) {
      console.error("Error conectando con el chat:", error);
      setMensajes((prev) => [...prev, { role: 'assistant', text: 'Error de red al conectar con el servidor de IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '9999px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          💬 Asistente IA
        </button>
      )}

      {/* Ventana flotante del Chat */}
      {isOpen && (
        <div 
          style={{
            width: '350px',
            height: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Cabecera */}
          <div style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>🤖 Asistente SLEP</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#dbeafe' }}>Potenciado por Llama 3.2 Local</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>

          {/* Cuerpo de mensajes */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mensajes.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    backgroundColor: msg.role === 'user' ? '#2563eb' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#1f2937',
                    border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#ffffff', color: '#4b5563', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', fontStyle: 'italic' }}>
                  🤖 Analizando base de datos...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pie / Input */}
          <form onSubmit={enviarMensaje} style={{ padding: '10px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                color: '#1f2937',
                backgroundColor: '#ffffff'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}