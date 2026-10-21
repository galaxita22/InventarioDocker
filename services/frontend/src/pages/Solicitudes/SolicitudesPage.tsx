import { useState, useEffect } from 'react';
import { Search, Plus, Folder, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import api from '../../services/api'; 
import './SolicitudesPage.css';

interface Solicitud {
  id: number;
  solicitante_id: number; 
  codigo_solicitud: string;
  tipo_operacion: string;
  estado: string;
  justificacion?: string;
  createdAt: string;
  Solicitante?: { id: number; nombre_usuario: string; email: string }; // Agregamos el id aquí
  Activo?: { descripcion: string; categoria: string };
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const userRaw = localStorage.getItem('user');
  const usuarioActual = userRaw ? JSON.parse(userRaw) : null;
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [listaActivos, setListaActivos] = useState<any[]>([]);
  const [listaUbicaciones, setListaUbicaciones] = useState<any[]>([]); // Estado para ubicaciones
  
  const [formSolicitud, setFormSolicitud] = useState({
    activo_id: '',
    tipo_operacion: 'asignacion',
    justificacion: '',
    ubicacion_destino_id: '' // Nuevo campo para traslados
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Peticiones en paralelo incluyendo ubicaciones
        const [resSolicitudes, resActivos, resUbicaciones] = await Promise.all([
          fetch(`${BACKEND_URL}/api/solicitudes`, { headers }),
          fetch(`${BACKEND_URL}/api/activos`, { headers }),
          fetch(`${BACKEND_URL}/api/ubicaciones`, { headers })
        ]);

        if (resSolicitudes.ok) setSolicitudes(await resSolicitudes.json());
        if (resActivos.ok) setListaActivos(await resActivos.json());
        if (resUbicaciones.ok) setListaUbicaciones(await resUbicaciones.json());
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [BACKEND_URL]);

  const evaluarSolicitud = async (id: number, nuevoEstado: string) => {
    try {
      // Sequelize ENUM exige que viajen en minúsculas
      const estadoDB = nuevoEstado.toLowerCase(); 
      await api.put(`/api/solicitudes/${id}/evaluar`, { estado: estadoDB });
      setSolicitudes(prev => 
        prev.map(sol => sol.id === id ? { ...sol, estado: estadoDB } : sol)
      );
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al evaluar la solicitud');
    }
  };

 const handleCrearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Formateamos los datos para que coincidan 100% con los modelos de Sequelize
      const payload = {
        activo_id: parseInt(formSolicitud.activo_id),
        tipo_operacion: formSolicitud.tipo_operacion,
        observaciones: formSolicitud.justificacion, // Traducimos 'justificacion' a 'observaciones'
        ubicacion_destino_id: formSolicitud.ubicacion_destino_id ? parseInt(formSolicitud.ubicacion_destino_id) : null
      };

      const res = await api.post('/api/solicitudes', payload);
      
      // El backend que armaste devuelve el objeto dentro de "res.data.datos"
      setSolicitudes([res.data.datos, ...solicitudes]);
      setModalAbierto(false); 
      setFormSolicitud({ activo_id: '', tipo_operacion: 'asignacion', justificacion: '', ubicacion_destino_id: '' }); 
      
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al crear la solicitud');
    }
  };

  // Métricas
  const total = solicitudes.length;
  const enRevision = solicitudes.filter(s => s.estado.toLowerCase() === 'pendiente').length;
  const aprobadas = solicitudes.filter(s => s.estado.toLowerCase() === 'aprobada').length;
  const rechazadas = solicitudes.filter(s => s.estado.toLowerCase() === 'rechazada').length;

  // Filtrado
  const solicitudesFiltradas = solicitudes.filter(sol => 
    sol.codigo_solicitud?.toLowerCase().includes(busqueda.toLowerCase()) ||
    sol.Activo?.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* HEADER DE LA PÁGINA */}
      <div className="page-header">
        <div>
          <h1>Gestión de Solicitudes de Activos</h1>
          <p>Administra los requerimientos de equipamiento y evalúa su estado</p>
        </div>
        <button className="btn-nueva-solicitud" onClick={() => setModalAbierto(true)}>
          <Plus size={18} /> Nueva Solicitud
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="metrics-grid">
        <div className="metric-card-sol">
          <div className="metric-info">
            <span>Total Solicitadas</span>
            <strong>{cargando ? '-' : total}</strong>
          </div>
          <div className="metric-icon bg-blue"><Folder size={22} /></div>
        </div>
        <div className="metric-card-sol">
          <div className="metric-info">
            <span>En Revisión</span>
            <strong>{cargando ? '-' : enRevision}</strong>
          </div>
          <div className="metric-icon bg-yellow"><Clock size={22} /></div>
        </div>
        <div className="metric-card-sol">
          <div className="metric-info">
            <span>Aprobadas</span>
            <strong>{cargando ? '-' : aprobadas}</strong>
          </div>
          <div className="metric-icon bg-green"><CheckCircle size={22} /></div>
        </div>
        <div className="metric-card-sol">
          <div className="metric-info">
            <span>Rechazadas</span>
            <strong>{cargando ? '-' : rechazadas}</strong>
          </div>
          <div className="metric-icon bg-red"><AlertTriangle size={22} /></div>
        </div>
      </div>

      {/* SECCIÓN DE TABLA */}
      <div className="table-section">
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Buscar por código o activo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="table-filters">
            <button className="btn-filter">Todos los estados <Filter size={16}/></button>
          </div>
        </div>

        <table className="solicitudes-table">
          <thead>
            <tr>
              <th>N° SOLICITUD</th>
              <th>ACTIVO / CATEGORÍA</th>
              <th>TIPO / DETALLE</th>
              <th>FECHA</th>
              <th>ESTADO</th>
              <th>ACCIONES (ADMIN)</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
            ) : solicitudesFiltradas.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay solicitudes</td></tr>
            ) : (
              solicitudesFiltradas.map((sol) => (
                <tr key={sol.id}>
                  <td className="text-blue font-semibold">{sol.codigo_solicitud || `SOL-00${sol.id}`}</td>
                  <td>
                    <div className="cell-primary">{sol.Activo?.descripcion || 'No especificado'}</div>
                    <div className="cell-secondary">{sol.Activo?.categoria || 'Sin categoría'}</div>
                  </td>
                  <td>
                    <div className="cell-primary" style={{ textTransform: 'capitalize' }}>{sol.tipo_operacion}</div>
                    <div className="cell-secondary">{sol.justificacion || 'Sin detalle'}</div>
                  </td>
                  <td>{new Date(sol.createdAt).toLocaleDateString('es-CL')}</td>
                  <td>
                    <span className={`badge-estado ${sol.estado.toLowerCase()}`}>
                      {sol.estado.charAt(0).toUpperCase() + sol.estado.slice(1)}
                    </span>
                  </td>
                    <td>
                {(String(sol.solicitante_id) === String(usuarioActual?.id) || String(sol.Solicitante?.id) === String(usuarioActual?.id)) ? (
                    <span style={{ fontSize: '0.85rem', color: '#eab308', fontStyle: 'italic', fontWeight: '500' }}>
                    Requiere otro aprobador
                    </span>
                ) : (
                    <div className="admin-actions">
                    <button 
                        className="btn-aprobar"
                        onClick={() => evaluarSolicitud(sol.id, 'aprobada')}
                        title="Aprobar Solicitud"
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button 
                        className="btn-rechazar"
                        onClick={() => evaluarSolicitud(sol.id, 'rechazada')}
                        title="Rechazar Solicitud"
                    >
                        <AlertTriangle size={18} />
                    </button>
                    </div>
                )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NUEVA SOLICITUD */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.25rem' }}>Nueva Solicitud de Activo</h2>
            <form onSubmit={handleCrearSolicitud}>
              
              <div className="form-group">
                <label>Seleccionar Activo</label>
                <select 
                  required
                  value={formSolicitud.activo_id}
                  onChange={(e) => setFormSolicitud({...formSolicitud, activo_id: e.target.value})}
                >
                  <option value="" disabled>Elige un activo de la lista...</option>
                  {listaActivos.map(activo => (
                    <option key={activo.id} value={activo.id}>
                      {activo.codigo_patrimonial} - {activo.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Requerimiento</label>
                <select 
                  value={formSolicitud.tipo_operacion}
                  onChange={(e) => setFormSolicitud({...formSolicitud, tipo_operacion: e.target.value})}
                >
                  <option value="asignacion">Asignación de Equipo</option>
                  <option value="traslado">Traslado de Ubicación</option>
                  <option value="devolucion">Devolución de Equipo</option>
                  <option value="baja">Dar de Baja (Desecho/Obsolescencia)</option>
                  <option value="alta">Alta / Nuevo Ingreso</option>
                </select>
              </div>

              {/* CAMPO DINÁMICO: UBICACIÓN DE DESTINO */}
              {formSolicitud.tipo_operacion === 'traslado' && (
                <div className="form-group" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  <label>Ubicación de Destino</label>
                  <select 
                    required
                    value={formSolicitud.ubicacion_destino_id}
                    onChange={(e) => setFormSolicitud({...formSolicitud, ubicacion_destino_id: e.target.value})}
                  >
                    <option value="" disabled>Seleccione hacia dónde se moverá...</option>
                    {listaUbicaciones.map(ubicacion => (
                      <option key={ubicacion.id} value={ubicacion.id}>
                        {ubicacion.nombre || ubicacion.descripcion || `Ubicación ID: ${ubicacion.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Justificación o Motivo</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Explique brevemente por qué necesita este movimiento..."
                  value={formSolicitud.justificacion}
                  onChange={(e) => setFormSolicitud({...formSolicitud, justificacion: e.target.value})}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
