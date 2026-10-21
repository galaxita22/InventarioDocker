import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  ClipboardList, 
  Users, // Agregado para gestionar usuarios (RF001-RF003)
  LogOut
} from 'lucide-react';
import logoInventario from '../../assets/logo-inventario.png'; // Ruta ajustada a la nueva arquitectura
import './Sidebar.css';

interface SidebarProps {
  isLoggedIn: boolean;
  userRole: string | null;
  onLogout?: () => void;
}

export default function Sidebar({ isLoggedIn, userRole, onLogout }: SidebarProps) {
  const location = useLocation();

  if (!isLoggedIn) return null;

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Consideramos los roles con permisos para aprobar/administrar
  const isAprobador = userRole === 'aprobador' || userRole === 'administrador' || userRole === 'supervisor';

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <img src={logoInventario} alt="SLEP Los Libertadores" className="sidebar-logo-img" />
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        {/* Gestión del patrimonio escolar */}
        <Link to="/activos" className={`nav-item ${isActive('/activos') ? 'active' : ''}`}>
          <Monitor size={20} />
          <span>Inventario de Activos</span>
        </Link>

        {/* Flujo de operaciones patrimoniales */}
        <Link to="/solicitudes" className={`nav-item ${isActive('/solicitudes') ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>Solicitudes</span>
        </Link>

        {/* Visible solo para roles administrativos */}
        {isAprobador && (
          <Link to="/usuarios" className={`nav-item ${isActive('/usuarios') ? 'active' : ''}`}>
            <Users size={20} />
            <span>Usuarios y Permisos</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">
          <strong>SLEP Los Libertadores</strong>
          <span style={{ textTransform: 'capitalize' }}>Perfil: {userRole || 'Usuario'}</span>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="btn-logout" title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}