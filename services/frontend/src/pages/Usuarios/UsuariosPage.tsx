import { useEffect, useState } from 'react';
import api from '../../services/api';
import './UsuariosPage.css';
import { Shield, UserCheck, Search, Users, Key, Plus, Save } from 'lucide-react';

export default function UsuariosPage() {
  const [tabActiva, setTabActiva] = useState<'miembros' | 'roles'>('miembros');
  
  // Estados de Miembros
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Estados de Roles y Permisos
  const [roles, setRoles] = useState<any[]>([]);
  const [permisosMaster, setPermisosMaster] = useState<any[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<any>(null);
  
  // Set con los IDs de los permisos encendidos (ej: [1, 2, 5])
  const [permisosActivos, setPermisosActivos] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatosGenerales();
  }, []);

  const cargarDatosGenerales = async () => {
    try {
      const [resUsuarios, resRoles, resPermisos] = await Promise.all([
        api.get('/api/accounts'),
        api.get('/api/roles'),
        api.get('/api/roles/permisos') // Tu nuevo endpoint
      ]);
      
      setUsuarios(resUsuarios.data);
      setRoles(resRoles.data);
      setPermisosMaster(resPermisos.data);
      
      // Seleccionamos el primer rol por defecto si existe
      if (resRoles.data.length > 0) {
        seleccionarRol(resRoles.data[0]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
    }
  };

  const handleAsignarRol = async (usuarioId: number, nuevoRolId: number) => {
    try {
      await api.put(`/api/accounts/${usuarioId}/rol`, { rol_id: nuevoRolId });
      
      // Actualizamos la tabla visualmente sin recargar la página
      setUsuarios(prev => prev.map(u => {
        if (u.id === usuarioId) {
          const nuevoRolObj = roles.find(r => r.id === nuevoRolId);
          return { ...u, rol_id: nuevoRolId, NivelAcceso: nuevoRolObj };
        }
        return u;
      }));
      
    } catch (error) {
      console.error("Error al asignar rol:", error);
      alert("Hubo un error al cambiar el rol.");
    }
  };

  const seleccionarRol = (rol: any) => {
    setRolSeleccionado(rol);
    // Extraemos solo los IDs de los permisos que este rol ya tiene asignados
    const idsPermisos = rol.Permisos.map((p: any) => p.id);
    setPermisosActivos(idsPermisos);
  };

  const handleTogglePermiso = (permisoId: number) => {
    setPermisosActivos(prev => 
      prev.includes(permisoId) 
        ? prev.filter(id => id !== permisoId) // Apagar
        : [...prev, permisoId]                // Encender
    );
  };

  const guardarCambios = async () => {
    if (!rolSeleccionado) return;
    setGuardando(true);
    try {
      await api.put(`/api/roles/${rolSeleccionado.id}/permisos`, {
        permisosIds: permisosActivos
      });
      alert('¡Permisos actualizados con éxito!');
      
      // Refrescamos la lista silenciosamente para tener la última versión
      const resRoles = await api.get('/api/roles');
      setRoles(resRoles.data);
      const rolActualizado = resRoles.data.find((r: any) => r.id === rolSeleccionado.id);
      if (rolActualizado) seleccionarRol(rolActualizado);
      
    } catch (error) {
      console.error("Error guardando permisos:", error);
      alert('Error al guardar los permisos');
    } finally {
      setGuardando(false);
    }
  };

  // Agrupamos los permisos maestros por módulo para renderizarlos ordenados
  const permisosPorModulo = permisosMaster.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="usuarios-container">
      <div className="header-section">
        <h2>Gestión de Accesos</h2>
        <p>Administra el personal, sus niveles de acceso y los permisos del sistema.</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${tabActiva === 'miembros' ? 'active' : ''}`}
          onClick={() => setTabActiva('miembros')}
        >
          <Users size={18} /> Miembros
        </button>
        <button 
          className={`tab-btn ${tabActiva === 'roles' ? 'active' : ''}`}
          onClick={() => setTabActiva('roles')}
        >
          <Key size={18} /> Roles y Permisos
        </button>
      </div>

      {/* PESTAÑA MIEMBROS */}
      {tabActiva === 'miembros' && (
        <div className="tab-content">
          <div className="table-controls">
            <div className="search-box">
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, correo o RUT..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>CONTACTO / RUT</th>
                <th>ROL ASIGNADO</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  {/* Columna 1: Nombre */}
                  <td>
                    <strong>{u.nombre_usuario}</strong>
                  </td>
                  
                  {/* Columna 2: Contacto y RUT */}
                  <td>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.rut}</div>
                  </td>
                  
                  {/* Columna 3: El Selector de Roles */}
                  <td>
                    <select 
                      className="select-rol-dropdown"
                      value={u.rol_id || u.NivelAcceso?.id || ''}
                      onChange={(e) => handleAsignarRol(u.id, parseInt(e.target.value))}
                    >
                      <option value="" disabled>Selecciona un rol...</option>
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  
                  {/* Columna 4: Estado */}
                  <td>
                    <span className="badge-activo">
                      <UserCheck size={14} /> Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PESTAÑA ROLES Y PERMISOS */}
      {tabActiva === 'roles' && (
        <div className="roles-layout">
          
          {/* Panel Lateral: Lista de Roles (Dinámica) */}
          <div className="roles-sidebar">
            <div className="sidebar-header">
              <h3>Roles del Sistema</h3>
              <button className="btn-icon" title="Crear nuevo rol"><Plus size={18} /></button>
            </div>
            <ul className="roles-list">
              {roles.map(rol => (
                <li 
                  key={rol.id} 
                  className={rolSeleccionado?.id === rol.id ? 'active' : ''}
                  onClick={() => seleccionarRol(rol)}
                >
                  <Shield size={16} color={rol.color || '#64748b'} />
                  <span>{rol.nombre}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Panel Principal: Interruptores dinámicos */}
          <div className="roles-content">
            {rolSeleccionado && (
              <>
                <div className="role-header">
                  <div>
                    <h3>Permisos de {rolSeleccionado.nombre}</h3>
                    <p>{rolSeleccionado.descripcion}</p>
                  </div>
                  <button 
                    className="btn-guardar" 
                    onClick={guardarCambios}
                    disabled={guardando}
                  >
                    <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

                <div className="permisos-grid">
                  {/* Iteramos sobre los módulos agrupados */}
                  {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                    <div className="permiso-card" key={modulo}>
                      <div className="permiso-header">
                        <h4 style={{ textTransform: 'capitalize' }}>Módulo: {modulo}</h4>
                      </div>
                      
                      {(permisos as any[]).map((permiso: any) => (
                        <div className="toggle-row" key={permiso.id}>
                          <div>
                            <strong style={{ textTransform: 'capitalize' }}>{permiso.accion.replace('_', ' ')}</strong>
                            <span>{permiso.descripcion_visual}</span>
                          </div>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={permisosActivos.includes(permiso.id)}
                              onChange={() => handleTogglePermiso(permiso.id)}
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}