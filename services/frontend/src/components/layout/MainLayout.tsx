import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Asegúrate de crear/mover Sidebar a esta misma carpeta
import ChatBot from '../common/ChatBot'; // 👈 1. Importa tu componente ChatBot (ajusta la ruta según donde lo hayas guardado)
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
    <div className="layout-principal relative">
      <Sidebar 
        isLoggedIn={auth.isLoggedIn} 
        userRole={auth.userRole} 
        onLogout={handleLogout} 
      />
      <main className="contenido-derecho relative">
        {/* Outlet es el espacio donde se renderizan las rutas hijas (ej. DashboardPage) */}
        <Outlet /> 

        {/* 🤖 2. El globo de la IA flota globalmente sobre cualquier vista hija */}
        <ChatBot />
      </main>
    </div>
  );
}