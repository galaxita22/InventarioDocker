import { Shield, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-layout">
      {/* Reemplaza con tu logo real cuando lo tengas */}
      <div className="landing-logo">
        <Package size={48} color="white" />
        <h2>INVENTARIO LOS LIBERTADORES</h2>
      </div>

      <div className="landing-header">
        <h2>Gestión Eficiente de Activos</h2>
        <p>
          Controla, solicita y administra el inventario tecnológico de la organización en un solo lugar de forma centralizada y segura.
        </p>
      </div>

      <div className="landing-cards">
        <div className="card">
          <div className="card-icon">
            <Shield size={24} />
          </div>
          <h3>Iniciar Sesión</h3>
          <p>Accede con tus credenciales institucionales para gestionar solicitudes y ver tus activos.</p>
          {/* Botón blanco con texto azul marino */}
          <Link to="/login" className="btn-blanco">Iniciar Sesión</Link>
        </div>

        <div className="card">
          <div className="card-icon">
            <Package size={24} />
          </div>
          <h3>Revisar Inventario</h3>
          <p>Consulta la disponibilidad pública de hardware y recursos de la sede central de forma inmediata.</p>
          <Link to="/inventario-publico" className="btn-outline">Revisar Inventario</Link>
        </div>
      </div>

      <footer className="landing-footer">
        © 2026 SLEP Los Libertadores — Plataforma de Gestión de Activos y Solicitudes de TI.
      </footer>
    </div>
  );
}