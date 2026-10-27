import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './UsuariosPage.css';
import { Shield, UserCheck, Search } from 'lucide-react';

interface Usuario {
  id: number;
  rut: string;
  nombre_usuario: string;
  email: string;
  role: string;
}

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/api/accounts');
      setUsuarios(res.data);
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarRol = async (id: number, nuevoRol: string) => {
    try {
      await api.put(`/api/accounts/${id}`, { role: nuevoRol });
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, role: nuevoRol } : u));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar el rol');
      cargarUsuarios(); // Recargamos para revertir el select si falló
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rut.includes(busqueda)
  );

  return (
    <div className="usuarios-container">
      <div className="header-section">
        <h2>Gestión de Usuarios y Roles</h2>
        <p>Administra los niveles de acceso y permisos del personal.</p>
      </div>

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

      <div className="table-section">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>USUARIO</th>
              <th>CONTACTO / RUT</th>
              <th>NIVEL DE ACCESO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Cargando directorio...</td></tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron usuarios.</td></tr>
            ) : (
              usuariosFiltrados.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-profile">
                      <div className="avatar-placeholder">
                        {user.nombre_usuario.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{user.nombre_usuario}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-primary">{user.email}</div>
                    <div className="cell-secondary">{user.rut}</div>
                  </td>
                  <td>
                    <select 
                      className={`role-select ${user.role}`}
                      value={user.role}
                      onChange={(e) => handleCambiarRol(user.id, e.target.value)}
                    >
                      <option value="solicitante">Solicitante (Básico)</option>
                      <option value="aprobador">Aprobador</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="administrador">Administrador (Total)</option>
                    </select>
                  </td>
                  <td>
                    <span className="badge-activo"><UserCheck size={14} /> Activo</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosPage;