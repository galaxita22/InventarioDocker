import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LandingPage from '../pages/Landing/LandingPage'; // <- Faltaba esta importación
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ActivosPage from '../pages/Activos/ActivosPage';
import FichaActivoPage from '../pages/Activos/FichaActivoPage'; // <- Faltaba esta importación
import SolicitudesPage from '../pages/Solicitudes/SolicitudesPage';

export default function AppRouter() {
  const [auth, setAuth] = useState({
    isLoggedIn: Boolean(localStorage.getItem('token')),
    userRole: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).role : null,
  });

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route 
        path="/" 
        element={
          !auth.isLoggedIn 
            ? <LandingPage /> 
            : <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/login" 
        element={
          !auth.isLoggedIn 
            ? <LoginPage setAuth={setAuth} /> 
            : <Navigate to="/dashboard" replace />
        } 
      />

      {/* Rutas Protegidas (Envueltas en el Layout principal) */}
      {auth.isLoggedIn ? (
        <Route element={<MainLayout auth={auth} setAuth={setAuth} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/activos" element={<ActivosPage />} />
          <Route path="/activos/:id" element={<FichaActivoPage />} />
          <Route path="/solicitudes" element={<SolicitudesPage />} />
          
          {/* Ruta 404 Interna */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        /* Si no está autenticado y busca una ruta rara, lo patea al inicio */
        <Route path="*" element={<Navigate to="/" replace />} />
      )}
    </Routes>
  );
}