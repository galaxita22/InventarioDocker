import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, DollarSign, FileText, Upload, Download } from 'lucide-react';
import api from '../../services/api';
import './ActivosPage.css'; // Reutilizamos estilos generales
import { QRCodeCanvas } from 'qrcode.react';

export default function FichaActivoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activo, setActivo] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoverQR, setHoverQR] = useState(false);
  
  useEffect(() => {

    const fetchFicha = async () => {
      try {
        const res = await api.get(`/api/activos/${id}`);
        setActivo(res.data);
      } catch (err: any) {
        setError('No se pudo cargar la ficha del activo');
      } finally {
        setCargando(false);
      }
    };
    
    fetchFicha();
  }, [id]);
  // Función para descargar el QR como imagen PNG
  const descargarQR = () => {
    const canvas = document.getElementById("qr-activo") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Activo_${activo.codigo_patrimonial}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('archivo', file);

    setSubiendo(true);
    try {
      const res = await api.post(`/api/activos/${id}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizamos el estado local inyectando el nuevo documento sin recargar la página
      setActivo((prev: any) => ({
        ...prev,
        Documentos: [...(prev.Documentos || []), res.data.documento]
      }));
      
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al subir el archivo');
    } finally {
      setSubiendo(false);
      // Limpiar el input para poder subir otro archivo si se quiere
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (cargando) return <div className="activos-container"><h2>Cargando ficha...</h2></div>;
  if (error || !activo) return <div className="activos-container"><h2 style={{color: 'red'}}>{error}</h2></div>;

  return (
    <div className="activos-container">
      <div className="activos-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-cancelar" onClick={() => navigate('/activos')} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Ficha de Activo: {activo.codigo_patrimonial}</h1>
            <p>Registro individual de patrimonio institucional</p>
          </div>
        </div>
        <span className={`badge ${activo.estado_conservacion.toLowerCase()}`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
          Estado: {activo.estado_conservacion.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        
        {/* Panel Identificación */}
        <div className="table-container" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '20px' }}>
            <Tag size={20} /> Datos de Identificación
          </h3>
          
          {/* Contenedor Flex: Divide el espacio en Izquierda (QR) y Derecha (Datos) */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            
            {/* COLUMNA IZQUIERDA: EL QR INTERACTIVO */}
            <div 
              style={{ position: 'relative', width: '150px', height: '150px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              onMouseEnter={() => setHoverQR(true)}
              onMouseLeave={() => setHoverQR(false)}
            >
              <QRCodeCanvas 
                id="qr-activo"
                value={`${window.location.origin}/activos/${activo.id}`} 
                size={110} 
                level={"H"}
                includeMargin={false}
              />
              <div style={{ marginTop: '8px', fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>
                {activo.codigo_patrimonial}
              </div>

              {/* OVERLAY OSCURO CON BOTÓN (Solo visible en hover) */}
              {hoverQR && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-in-out' }}>
                  <button 
                    onClick={descargarQR}
                    title="Descargar Etiqueta"
                    style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', transition: 'transform 0.1s' }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Download size={22} />
                  </button>
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: TUS DATOS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1rem', color: '#334155' }}>
              <p style={{ margin: 0 }}><strong>Descripción:</strong> {activo.descripcion}</p>
              <p style={{ margin: 0 }}><strong>Categoría:</strong> {activo.categoria}</p>
              <p style={{ margin: 0 }}><strong>Fecha de Ingreso:</strong> {new Date(activo.createdAt).toLocaleDateString('es-CL')}</p>
            </div>

          </div>
        </div>

        {/* Panel Ubicación */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <MapPin size={20} /> Ubicación Física
          </h3>
          <p><strong>Establecimiento:</strong> {activo.Ubicacion?.Establecimiento?.nombre || 'No asignado'}</p>
          <p><strong>Dependencia:</strong> {activo.Ubicacion?.nombre}</p>
        </div>

        {/* Panel Valorización */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <DollarSign size={20} /> Valorización
          </h3>
          <p><strong>Valor Contable:</strong> ${activo.valor?.toLocaleString('es-CL') || 0}</p>
        </div>
        
        {/* Panel Documentos */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <FileText size={20} /> Documentos Adjuntos
          </h3>
          
          {activo.Documentos && activo.Documentos.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              {activo.Documentos.map((doc: any) => (
                <li key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <FileText size={16} color="#64748b" />
                  {/* Usamos tu variable de entorno para que el link apunte a la IP de tu VM */}
                  <a href={`${import.meta.env.VITE_BACKEND_URL}${doc.url_archivo}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                    {doc.nombre_original}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ border: '2px dashed #cbd5e1', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Sin documentos (facturas o actas) adjuntos.
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            {/* Input oculto que se activa al presionar el botón */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf, image/jpeg, image/png, image/webp"
              onChange={handleFileUpload} 
            />
            <button 
              className="btn-primario" 
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: subiendo ? 0.7 : 1 }}
            >
              <Upload size={16} /> {subiendo ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}