import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Asegúrate de crear/mover Sidebar a esta misma carpeta
import './MainLayout.css'; // Asegúrate de crear este archivo CSS para estilos específicos del layout
interface MainLayoutProps {
  auth: { isLoggedIn: boolean; userRole: string | null };
  setAuth: React.Dispatch<React.SetStateAction<{ isLoggedIn: boolean; userRole: string | null }>>;
}

export default function MainLayout({ auth, setAuth }: MainLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ isLoggedIn: false, userRole: null });
    navigate('/', { replace: true });
  };

  return (
    <div className="layout-principal">
      <Sidebar 
        isLoggedIn={auth.isLoggedIn} 
        userRole={auth.userRole} 
        onLogout={handleLogout} 
      />
      <main className="contenido-derecho">
        {/* Outlet es el espacio donde se renderizan las rutas hijas (ej. DashboardPage) */}
        <Outlet /> 
      </main>
    </div>
  );
}