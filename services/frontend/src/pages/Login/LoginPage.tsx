import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

interface LoginPageProps {
  setAuth: React.Dispatch<React.SetStateAction<{ isLoggedIn: boolean; userRole: string | null }>>;
}

export default function LoginPage({ setAuth }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
      
      const response = await fetch(`${BACKEND_URL}/api/accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      // Guardamos la sesión en el almacenamiento local
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.account));
      
      // Actualizamos el estado global para que el Router nos deje pasar al Layout protegido
      setAuth({
        isLoggedIn: true,
        userRole: data.account.role,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card">
        <Shield size={40} strokeWidth={2} className="login-icon" />
        <h2>Iniciar Sesión</h2>
        <p>Ingresa tus credenciales corporativas para continuar</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo Electrónico <span>*</span></label>
            <div className="input-wrapper">
              <input 
                type="email" 
                placeholder="usuario@slep.cl" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña <span>*</span></label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
