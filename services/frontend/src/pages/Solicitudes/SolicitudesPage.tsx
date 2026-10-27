import { useState, useEffect } from 'react';
import { Search, Plus, Folder, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import api from '../../services/api'; 
import './SolicitudesPage.css';
import Select from 'react-select';

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
  observaciones?: string; // para cuando se rechaza una solicitud
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
  
  const [modalAltaAbierto, setModalAltaAbierto] = useState(false);
  const [solicitudAltaId, setSolicitudAltaId] = useState<number | null>(null);
  const [formAlta, setFormAlta] = useState({
    categoria: '',
    ubicacion_id: '',
    valor: 0,
    estado_conservacion: 'nuevo'
  });

  const [filtroEstado, setFiltroEstado] = useState('');

  const [formSolicitud, setFormSolicitud] = useState({
    activo_id: '',
    tipo_operacion: 'asignacion',
    justificacion: '',
    ubicacion_destino_id: '', 
    fecha_inicio: '',       
    fecha_fin: '',          
    nombre_nuevo_activo: '' 
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
    let observaciones = '';
    
    // Si rechaza, le exigimos escribir el motivo
    if (nuevoEstado === 'rechazada') {
      const motivo = window.prompt("Por favor, ingresa el motivo del rechazo:");
      if (motivo === null) return; // Si cancela el cuadro de diálogo, abortamos
      if (motivo.trim() === '') {
        alert("Debes ingresar un motivo obligatorio para rechazar la solicitud.");
        return;
      }
      observaciones = motivo;
    }

    try {
      // Enviamos el estado y la observación al backend
      await api.put(`/api/solicitudes/${id}/evaluar`, { estado: nuevoEstado, observaciones });
      setSolicitudes(prev => prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado } : sol));
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al evaluar la solicitud');
    }
  };

 const handleCrearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Armamos el payload incluyendo los nuevos campos temporales y de alta
      const payload = {
        activo_id: formSolicitud.tipo_operacion === 'alta' ? null : parseInt(formSolicitud.activo_id),
        tipo_operacion: formSolicitud.tipo_operacion,
        justificacion: formSolicitud.justificacion,
        ubicacion_destino_id: formSolicitud.ubicacion_destino_id ? parseInt(formSolicitud.ubicacion_destino_id) : null,
        fecha_inicio: formSolicitud.fecha_inicio || null,
        fecha_fin: formSolicitud.fecha_fin || null,
        nombre_nuevo_activo: formSolicitud.nombre_nuevo_activo || null
      };
      
      const res = await api.post('/api/solicitudes', payload);
             
      if (res.data.solicitud) {
        setSolicitudes([res.data.solicitud, ...solicitudes]);
      }
      
      setModalAbierto(false);
      
      setFormSolicitud({ 
        activo_id: '', 
        tipo_operacion: 'asignacion', 
        justificacion: '', 
        ubicacion_destino_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        nombre_nuevo_activo: ''
      });
            
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al crear la solicitud');
    }
  };

  const esAprobador = ['administrador', 'aprobador', 'supervisor'].includes(usuarioActual?.role?.toLowerCase());
  const [tabActiva, setTabActiva] = useState(esAprobador ? 'gestion' : 'mis_solicitudes');

  // Métricas
  const total = solicitudes.length;
  const enRevision = solicitudes.filter(s => s?.estado.toLowerCase() === 'pendiente').length;
  const aprobadas = solicitudes.filter(s => s?.estado.toLowerCase() === 'aprobada').length;
  const rechazadas = solicitudes.filter(s => s?.estado.toLowerCase() === 'rechazada').length;

  // Filtrado
  const solicitudesPorPestana = solicitudes.filter(sol => {
  const esPropia = String(sol.solicitante_id) === String(usuarioActual?.id) || String(sol.Solicitante?.id) === String(usuarioActual?.id);
  
  if (tabActiva === 'mis_solicitudes') {
    return esPropia;
  } else {
    // PUNTO 1: En gestión solo vemos las de otros que estén "pendientes"
    return !esPropia && sol.estado?.toLowerCase() === 'pendiente';
  }
});

const opcionesActivos = listaActivos.map(activo => ({
  value: String(activo.id),
  label: `${activo.codigo_patrimonial} - ${activo.descripcion}`
}));

const solicitudesFiltradas = solicitudesPorPestana.filter(sol => {
  const coincideBusqueda = sol.codigo_solicitud?.toLowerCase().includes(busqueda.toLowerCase()) ||
                           sol.Activo?.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
  // PUNTO 2: Filtro real por estado
  const coincideEstado = filtroEstado === '' || sol.estado?.toLowerCase() === filtroEstado.toLowerCase();
  
  return coincideBusqueda && coincideEstado;
});

const handleAprobarAltaConfirm = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!solicitudAltaId) return;
  
  try {
    const payload = { 
      estado: 'aprobada', 
      datosAlta: {
        ...formAlta,
        ubicacion_id: parseInt(formAlta.ubicacion_id)
      } 
    };
    
    await api.put(`/api/solicitudes/${solicitudAltaId}/evaluar`, payload);
    
    setSolicitudes(prev => prev.map(sol => sol.id === solicitudAltaId ? { ...sol, estado: 'aprobada' } : sol));
    setModalAltaAbierto(false);
    setFormAlta({ categoria: '', ubicacion_id: '', valor: 0, estado_conservacion: 'nuevo' });
  } catch (error: any) {
    alert(error.response?.data?.mensaje || 'Error al aprobar el alta');
  }
};

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

      {/* PESTAÑAS (TABS) */}
      <div className="tabs-container">
        <button 
          className={`btn-tab ${tabActiva === 'mis_solicitudes' ? 'active' : ''}`}
          onClick={() => setTabActiva('mis_solicitudes')}
        >
          Mis Solicitudes
        </button>
        
        {esAprobador && (
          <button 
            className={`btn-tab ${tabActiva === 'gestion' ? 'active' : ''}`}
            onClick={() => setTabActiva('gestion')}
          >
            Para Gestionar
          </button>
        )}
      </div>

{/* SECCIÓN DE TABLA */}
<div className="table-section"></div>

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
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#475569' }}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        {tabActiva === 'mis_solicitudes' ? (
  <div className="mis-solicitudes-grid">
    {solicitudesFiltradas.length === 0 ? (
      <p style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>No tienes solicitudes registradas.</p>
    ) : (
      solicitudesFiltradas.map((sol) => (
        <div key={sol.id} className="solicitud-card">
          <div className="card-header">
            <div>
              <h3>{sol.Activo?.descripcion || 'No especificado'}</h3>
              <p>{sol.codigo_solicitud || `SOL-00${sol.id}`}</p>
            </div>
            <span className={`badge-estado ${sol.estado?.toLowerCase()}`}>
              {sol.estado?.charAt(0).toUpperCase() + sol.estado?.slice(1)}
            </span>
          </div>
          <div className="card-body">
            <p><strong>Tipo:</strong> <span style={{ textTransform: 'capitalize' }}>{sol.tipo_operacion}</span></p>
            <p><strong>Motivo:</strong> {sol.justificacion || sol.observaciones || 'Sin detalle'}</p>
            <p><strong>Fecha:</strong> {new Date(sol.createdAt).toLocaleDateString('es-CL')}</p>
          </div>
        </div>
      ))
    )}
  </div>
) : (
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
        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay solicitudes para gestionar</td></tr>
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
              <div className="cell-secondary">{sol.justificacion || sol.observaciones || 'Sin detalle'}</div>
            </td>
            <td>{new Date(sol.createdAt).toLocaleDateString('es-CL')}</td>
            <td>
              <span className={`badge-estado ${sol.estado?.toLowerCase()}`}>
                {sol.estado?.charAt(0).toUpperCase() + sol.estado?.slice(1)}
              </span>
            </td>
            <td>
              <div className="admin-actions">
                <button 
                  className="btn-aprobar" 
                  onClick={() => {
                    if (sol.tipo_operacion === 'alta') {
                      setSolicitudAltaId(sol.id);
                      setModalAltaAbierto(true); // Abre el modal de clasificación en lugar de aprobar directo
                    } else {
                      evaluarSolicitud(sol.id, 'aprobada');
                    }
                  }} 
                  title="Aprobar Solicitud"
                >
                  <CheckCircle size={18} />
                </button>
                <button className="btn-rechazar" onClick={() => evaluarSolicitud(sol.id, 'rechazada')} title="Rechazar Solicitud">
                  <AlertTriangle size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
)}
      </div>

      {/* MODAL PARA CLASIFICAR UN ALTA NUEVA ANTES DE APROBAR */}
      {modalAltaAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Clasificar Nuevo Ingreso</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>Asigna los datos técnicos del equipo para ingresarlo al inventario.</p>
            
            <form onSubmit={handleAprobarAltaConfirm}>
              <div className="form-group">
                <label>Categoría</label>
                <input 
                  type="text" 
                  placeholder="Ej: Computación, Mobiliario..."
                  value={formAlta.categoria}
                  onChange={(e) => setFormAlta({...formAlta, categoria: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Ubicación Asignada</label>
                <select 
                  value={formAlta.ubicacion_id}
                  onChange={(e) => setFormAlta({...formAlta, ubicacion_id: e.target.value})}
                  required
                >
                  <option value="">Seleccione una ubicación</option>
                  {/* Reutilizamos el estado de ubicaciones que debes tener en el archivo */}
                  <option value="1">Bodega Central</option> 
                  <option value="2">Laboratorio Computación</option>
                </select>
              </div>

              <div className="date-row">
                <div className="form-group">
                  <label>Estado Físico</label>
                  <select 
                    value={formAlta.estado_conservacion}
                    onChange={(e) => setFormAlta({...formAlta, estado_conservacion: e.target.value})}
                    required
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Valor Monetario ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formAlta.valor}
                    onChange={(e) => setFormAlta({...formAlta, valor: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalAltaAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Aprobar y Crear Activo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NUEVA SOLICITUD */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.25rem' }}>Nueva Solicitud de Activo</h2>
            <form onSubmit={handleCrearSolicitud}>
              
              <div className="form-group">
                <label>{formSolicitud.tipo_operacion === 'alta' ? 'Nombre del Nuevo Activo' : 'Seleccionar Activo'}</label>
  
                {/* Si es ALTA, mostramos un input de texto. Si no, mostramos el buscador */}
                {formSolicitud.tipo_operacion === 'alta' ? (
                  <input 
                    type="text" 
                    placeholder="Ej: Proyector Epson X100"
                    value={formSolicitud.nombre_nuevo_activo}
                    onChange={(e) => setFormSolicitud({...formSolicitud, nombre_nuevo_activo: e.target.value})}
                    required
                  />
                ) : (
                  <Select 
                    options={opcionesActivos}
                    placeholder="Escribe para buscar un activo..."
                    onChange={(opcion) => setFormSolicitud({...formSolicitud, activo_id: opcion ? opcion.value : ''})}
                    isClearable
                    noOptionsMessage={() => "No se encontraron activos"}
                  />
                )}
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

              {formSolicitud.tipo_operacion === 'asignacion' && (
                <div className="date-row">
                  <div className="form-group">
                    <label>Fecha de Inicio</label>
                    <input 
                      type="date" 
                      value={formSolicitud.fecha_inicio}
                      onChange={(e) => setFormSolicitud({...formSolicitud, fecha_inicio: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Devolución Esperada</label>
                    <input 
                      type="date" 
                      value={formSolicitud.fecha_fin}
                      onChange={(e) => setFormSolicitud({...formSolicitud, fecha_fin: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}

              {/* CAMPO DINÁMICO: UBICACIÓN DE DESTINO */}
              {formSolicitud.tipo_operacion === 'traslado' && (
                <div className="form-group" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  <label>Ubicación de Destino</label>
                  {(() => {
                    const activoSel = listaActivos.find(a => String(a.id) === String(formSolicitud.activo_id));
                    return activoSel ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                        📍 Origen actual: <strong>{activoSel.Ubicacion?.nombre || 'Bodega Central'}</strong>
                      </p>
                    ) : null;
                  })()}
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
