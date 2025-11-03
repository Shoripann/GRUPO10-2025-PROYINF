import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Profesor from './Profesor';
import Alumno from './Alumno';
import Resultados from './Resultados';
import Banco from './Banco';             
import './index.css';

// ✅ Componente Login simple y elegante
const Login = ({ onLoginOk }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      const raw = await response.text();
      let data = null;
      let text = raw;
      try { data = JSON.parse(raw); } catch {}

      if (!response.ok) {
        const msg = (data && data.error) || text || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      if (!data || !data.role || !data.user) {
        throw new Error('Respuesta del servidor inválida');
      }

      const sesion = { role: data.role, user: data.user };
      localStorage.setItem('sesion', JSON.stringify(sesion));
      onLoginOk(sesion);

      if (data.role === 'profesor') {
        navigate('/profesor');
      } else {
        navigate('/alumno');
      }

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      console.error('Error de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Plataforma Educativa</h1>
          <p className="text-gray-600 text-sm">Sistema de ensayos</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="usuario@institucion.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength="4"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

const RutaPrivada = ({ isAllowed, children }) => {
  return isAllowed ? children : <Navigate to="/" />;
};

const App = () => {
  const [logueado, setLogueado] = useState(false);
  const [rol, setRol] = useState(null);         
  const [usuario, setUsuario] = useState(null);  
  const [cargando, setCargando] = useState(true); 

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sesion'));
      if (saved && saved.role && saved.user) {
        setRol(saved.role);
        setUsuario(saved.user);
        setLogueado(true);
      }
    } catch {
      // Ignorar errores de localStorage
    } finally {
      setCargando(false); 
    }
  }, []);

  const handleLoginOk = ({ role, user }) => {
    setRol(role);
    setUsuario(user);
    setLogueado(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('sesion');
    setLogueado(false);
    setRol(null);
    setUsuario(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            logueado ? (
              rol === 'profesor' ? 
                <Navigate to="/profesor" replace /> : 
                <Navigate to="/alumno" replace />
            ) : (
              <Login onLoginOk={handleLoginOk} />
            )
          }
        />

        <Route
          path="/profesor"
          element={
            <RutaPrivada isAllowed={logueado && rol === 'profesor'}>
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b">
                  <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                      <h1 className="text-lg font-semibold text-gray-800">Panel del Profesor</h1>
                      <p className="text-gray-600 text-sm">Bienvenido, {usuario?.nombre}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border rounded-md"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </header>
                <Profesor username={usuario?.nombre} />
              </div>
            </RutaPrivada>
          }
        />

        <Route
          path="/alumno"
          element={
            <RutaPrivada isAllowed={logueado && rol === 'alumno'}>
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b">
                  <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                      <h1 className="text-lg font-semibold text-gray-800">Panel del Estudiante</h1>
                      <p className="text-gray-600 text-sm">Bienvenido, {usuario?.nombre}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border rounded-md"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </header>
                <Alumno alumnoId={usuario?.id} />
              </div>
            </RutaPrivada>
          }
        />

        <Route
          path="/banco"
          element={
            <RutaPrivada isAllowed={logueado && rol === 'alumno'}>
              <Banco />
            </RutaPrivada>
          }
        />

        <Route
          path="/resultados"
          element={
            <RutaPrivada isAllowed={logueado}>
              <Resultados />
            </RutaPrivada>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
