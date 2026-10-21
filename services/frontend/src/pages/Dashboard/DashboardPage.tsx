import { useState, useEffect } from 'react';
import { Search, Bell, Package, AlertTriangle, Clock, TrendingUp, Filter } from 'lucide-react';
import './DashboardPage.css';
import api from '../../services/api';

interface Activo {
  id: number;
  codigo_patrimonial: string;
  estado_conservacion: string;
  valor: number;
  descripcion: string;
}

interface Solicitud {
  id: number;
  codigo_solicitud: string;
  tipo_operacion: string;
  estado: string;
  Solicitante?: { nombre_usuario: string };
  Activo?: { descripcion: string };
}

export default function DashboardPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Extraemos datos de sesión
  const userRaw = localStorage.getItem('user');
  const usuarioActual = userRaw ? JSON.parse(userRaw) : null;
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Peticiones concurrentes a backend
        const [resActivos, resSolicitudes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/activos`, { headers }),
          fetch(`${BACKEND_URL}/api/solicitudes`, { headers }) // O el endpoint que traiga los movimientos
        ]);

        if (resActivos.ok) setActivos(await resActivos.json());
        if (resSolicitudes.ok) setSolicitudes(await resSolicitudes.json());

      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);
  
  const evaluarSolicitud = async (id: number, nuevoEstado: string) => {
    try {
      // Usamos exactamente tu ruta: /:id/evaluar
      await api.put(`/api/solicitudes/${id}/evaluar`, { estado: nuevoEstado });
      
      // Actualizamos la tabla localmente para que el cambio se vea al instante
      setSolicitudes((prev: any[]) => 
        prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado } : sol)
      );
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al evaluar la solicitud');
    }
  };
  // Cálculos de métricas
  const totalActivos = activos.length;
  const stockCritico = activos.filter(a => a.estado_conservacion === 'malo' || a.estado_conservacion === 'obsoleto').length;
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  
  const alertasGeneradas = [];
  if (pendientes > 0) alertasGeneradas.push({ id: 1, mensaje: `Existen ${pendientes} solicitudes de movimiento pendientes de revisión.`, nivel: 'ADVERTENCIA' });
  if (stockCritico > 0) alertasGeneradas.push({ id: 2, mensaje: `${stockCritico} activos requieren revisión por estado crítico u obsolescencia.`, nivel: 'CRÍTICO' });

  const iniciales = (usuarioActual?.nombre_usuario || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="dashboard-container">
      {/* Topbar */}
      <header className="dashboard-topbar">
        <div className="topbar-search">
          <Search size={18} className="search-icon" color="#94a3b8" />
          <input type="text" placeholder="Buscar activos o movimientos..." />
        </div>
        
        <div className="topbar-profile">
          <button className="notification-btn">
            <Bell size={20} />
            {alertasGeneradas.length > 0 && <span className="notification-badge">{alertasGeneradas.length}</span>}
          </button>
          
          <div className="profile-info">
            <strong>{usuarioActual?.nombre_usuario || 'Administrador'}</strong>
            <span style={{ textTransform: 'capitalize' }}>{usuarioActual?.role || 'Aprobador'}</span>
          </div>
          
          <div className="profile-avatar">
            {iniciales}
          </div>
        </div>
      </header>

      {/* Tarjetas de Métricas */}
      <section className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-content">
            <span>Total Activos</span>
            <strong>{cargando ? '...' : totalActivos}</strong>
          </div>
          <div className="metric-icon blue-icon"><Package size={24} /></div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <span>Stock Crítico / Baja</span>
            <strong>{cargando ? '...' : stockCritico}</strong>
          </div>
          <div className="metric-icon red-icon"><AlertTriangle size={24} /></div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <span>Solicitudes Pendientes</span>
            <strong>{cargando ? '...' : pendientes}</strong>
          </div>
          <div className="metric-icon yellow-icon"><Clock size={24} /></div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <span>Nuevos Ingresos</span>
            <strong>{cargando ? '...' : solicitudes.filter(s => s.tipo_operacion === 'alta').length}</strong>
          </div>
          <div className="metric-icon green-icon"><TrendingUp size={24} /></div>
        </div>
      </section>

      {/* Grill Principal */}
      <div className="dashboard-main-grid">
        {/* Tabla de Movimientos */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Últimos Movimientos</h2>
              <p>Registro histórico reciente de activos y productos</p>
            </div>
            <button className="btn-filtrar">
              <Filter size={16} /> Filtrar
            </button>
          </div>
          
          <table className="movimientos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Activo / Producto</th>
                <th>Tipo Movimiento</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Acciones</th> {/* <-- NUEVO ENCABEZADO */}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6} style={{textAlign: 'center'}}>Cargando datos...</td></tr>
              ) : solicitudes.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign: 'center'}}>No hay movimientos registrados</td></tr>
              ) : (
                solicitudes.slice(0, 5).map((sol) => (
                  <tr key={sol.id}>
                    <td className="text-blue">{sol.codigo_solicitud || `MOV-00${sol.id}`}</td>
                    <td>{sol.Activo?.descripcion || 'Activo no especificado'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{sol.tipo_operacion}</td>
                    <td>{sol.Solicitante?.nombre_usuario || 'Sistema'}</td>
                    <td>
                      <span className={`status-badge ${sol.estado?.toLowerCase()}`}>
                        {sol.estado?.toUpperCase()}
                      </span>
                    </td>
                    
                    {/* 👇 AQUÍ ESTÁ INTEGRADO TU BLOQUE DE BOTONES 👇 */}
                    <td style={{ display: 'flex', gap: '8px' }}>
                      {sol.estado?.toLowerCase() === 'pendiente' ? (
                        <>
                          <button 
                            className="btn-primario" 
                            style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => evaluarSolicitud(sol.id, 'aprobada')}
                          >
                            Aprobar
                          </button>
                          <button 
                            className="btn-secundario" 
                            style={{ color: '#ef4444', borderColor: '#ef4444', padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => evaluarSolicitud(sol.id, 'rechazada')}
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: sol.estado?.toLowerCase() === 'aprobada' ? '#22c55e' : '#ef4444' 
                        }}>
                          {sol.estado?.toUpperCase()}
                        </span>
                      )}
                    </td>
                    {/* 👆 FIN DEL BLOQUE 👆 */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Alertas */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Alertas Activas</h2>
              <p>Acciones y advertencias urgentes</p>
            </div>
          </div>
          
          <div className="alerts-list">
            {alertasGeneradas.length === 0 && !cargando ? (
              <div className="alert-card" style={{ borderLeft: '4px solid #22c55e' }}>
                <p><strong>Todo al día</strong></p>
                <span className="alert-level" style={{color: '#22c55e'}}>INFO</span>
              </div>
            ) : (
              alertasGeneradas.map((alerta) => (
                <div key={alerta.id} className={`alert-card ${alerta.nivel.toLowerCase()}`}>
                  <p><strong>{alerta.mensaje}</strong></p>
                  <span className="alert-level">{alerta.nivel}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
