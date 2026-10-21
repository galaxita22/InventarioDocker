import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { type Activo } from '../../types/Activo';
import ModalNuevoActivo from '../../components/specific/ModalNuevoActivo';
import './ActivosPage.css';

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
const ubicacionesMap = new Map();
  activos.forEach((activo: any) => {
    if (activo.ubicacion_id) {
      // Intenta leer el nombre (depende de cómo se llame el campo en tu BD, suele ser 'nombre' o 'descripcion')
      const nombreMostrar = activo.Ubicacion?.nombre || activo.Ubicacion?.descripcion || `Ubicación ID: ${activo.ubicacion_id}`;
      
      if (!ubicacionesMap.has(activo.ubicacion_id)) {
        ubicacionesMap.set(activo.ubicacion_id, nombreMostrar);
      }
    }
  });
  useEffect(() => {
    const fetchActivos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/api/activos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar los activos');
        
        const data = await response.json();
        setActivos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchActivos();
  }, [BACKEND_URL]);
  const ubicacionesUnicas = Array.from(ubicacionesMap.entries());
  // Filtrado dinámico por código patrimonial o descripción
  const activosFiltrados = activos.filter((activo: any) => {
    const textoBusqueda = busqueda.toLowerCase();
    
    // Verifica si coincide con el texto (búsqueda normal)
    const coincideBusqueda = 
      activo.codigo_patrimonial?.toLowerCase().includes(textoBusqueda) || 
      activo.descripcion?.toLowerCase().includes(textoBusqueda);
      
    // Verifica si coincide con el filtro del <select> (si está vacío, muestra todos)
    const coincideUbicacion = filtroUbicacion === '' || activo.ubicacion_id?.toString() === filtroUbicacion;

    // Solo muestra el activo si cumple AMBAS condiciones
    return coincideBusqueda && coincideUbicacion;
  });

  return (
    <div className="activos-container">
      <div className="activos-header">
        <div>
          <h1>Patrimonio Institucional</h1>
          <p>Gestión centralizada de bienes muebles y activos fijos del SLEP</p>
        </div>
        <button className="btn-primario" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Registrar Activo
        </button>
      </div>

      <div className="activos-toolbar">
        {/* Contenedor de Búsqueda y Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        
        {/* Barra de Búsqueda */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Search size={20} color="#64748b" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Buscar por código patrimonial o descripción..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }} 
          />
        </div>

        {/* NUEVO: Filtro de Ubicación */}
        {/* Filtro de Ubicación Mejorado */}
        <select 
          value={filtroUbicacion} 
          onChange={(e) => setFiltroUbicacion(e.target.value)}
          style={{ 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0', 
            background: 'white', 
            color: '#334155', 
            fontSize: '0.95rem', 
            outline: 'none', 
            cursor: 'pointer', 
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
            minWidth: '220px' 
          }}
        >
          <option value="">Todas las ubicaciones</option>
          {ubicacionesUnicas.map(([id, nombre]) => (
            <option key={id as string} value={id as string}>
              {nombre as string}
            </option>
          ))}
        </select>
        
      </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>}

      <div className="table-container">
        <table className="activos-table">
          <thead>
            <tr>
              <th>Cód. Patrimonial</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Valoración</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>Cargando inventario...</td></tr>
            ) : activosFiltrados.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>No se encontraron activos registrados</td></tr>
            ) : (
              activosFiltrados.map((activo) => (
                <tr key={activo.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-primario)' }}>
                    {activo.codigo_patrimonial}
                  </td>
                  <td>
                    <strong>{activo.descripcion}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      Ubicación ID: {activo.ubicacion_id}
                    </div>
                  </td>
                  <td>{activo.categoria}</td>
                  <td style={{ fontWeight: 600 }}>
                    ${activo.valor?.toLocaleString('es-CL') || 0}
                  </td>
                  <td>
                    <span className={`badge ${activo.estado_conservacion.toLowerCase()}`}>
                      {activo.estado_conservacion}
                    </span>
                  </td>
                  
                  {/* COLUMNA DE ACCIONES (El ojito, editar y eliminar) */}
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="btn-accion" 
                        title="Ver Ficha" 
                        onClick={() => navigate(`/activos/${activo.id}`)}
                      >
                        <Eye size={18} color="#3b82f6" />
                      </button>
                      <button className="btn-accion" title="Editar Activo">
                        <Edit size={18} />
                      </button>
                      <button className="btn-accion" title="Dar de Baja" style={{ color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    <ModalNuevoActivo 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          window.location.reload(); 
        }} 
      />
    </div>
  );
}
