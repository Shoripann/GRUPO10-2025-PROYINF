import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Profesor from './Profesor';
import Alumno from './Alumno';
import Resultados from './Resultados';
import Banco from './Banco';             
import './index.css';

const ProfesorWrapper = ({ usuario }) => {
  const location = useLocation();
  const profesor = usuario || location.state?.user;

  if (!profesor) {
    return <p>Error: No se encontró información del profesor.</p>;
  }
  return <Profesor username={profesor.nombre} />;
};

// Página de inicio
const Home = ({ setModo }) => (
  <div className="text-center mt-10">
    <div className="card space-y-4">
      <h1 className="text-3xl font-bold">Bienvenido</h1>
      <button onClick={() => setModo('prof')} className="btn">Entrar como Profesor</button>
      <button onClick={() => setModo('alumno')} className="btn">Entrar como Alumno</button>
    </div>
  </div>
);

// Página de login
const Login = ({ modo, setModo, onLoginOk }) => {
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: userInput.trim(), 
          password: passInput.trim() 
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
      } else if (data.role === 'alumno') {
        navigate('/alumno');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error('Error de login:', err);
      alert(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="text-center mt-10">
      <div className="card space-y-2 mt-6">
        <h2 className="text-xl font-semibold">
          Iniciar sesión como {modo === 'prof' ? 'Profesor' : 'Alumno'}
        </h2>
        <input
          className="input"
          type="text"
          placeholder="Correo electrónico"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={passInput}
          onChange={(e) => setPassInput(e.target.value)}
        />
        <button onClick={manejarLogin} className="btn">Iniciar Sesión</button>
        <br />
        <button onClick={() => setModo(null)} className="btn bg-gray-500">
          Volver
        </button>
      </div>
    </div>
  );
};


const RutaPrivada = ({ isAllowed, children }) => {
  return isAllowed ? children : <Navigate to="/" />;
};


const App = () => {
  const [modo, setModo] = useState(null);
  const [logueado, setLogueado] = useState(false);
  const [rol, setRol] = useState(null);         
  const [usuario, setUsuario] = useState(null);  

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sesion'));
      if (saved && saved.role && saved.user) {
        setRol(saved.role);
        setUsuario(saved.user);
        setLogueado(true);
      }
    } catch {
    }
  }, []);

  const handleLoginOk = ({ role, user }) => {
    setRol(role);
    setUsuario(user);
    setLogueado(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !modo ? (
              <Home setModo={setModo} />
            ) : (
              <Login
                modo={modo}
                setModo={setModo}
                onLoginOk={handleLoginOk}
              />
            )
          }
        />

        <Route
          path="/profesor"
          element={
            <RutaPrivada isAllowed={logueado && rol === 'profesor'}>
              <ProfesorWrapper usuario={usuario} />
            </RutaPrivada>
          }
        />

        <Route
          path="/alumno"
          element={
            <RutaPrivada isAllowed={logueado && rol === 'alumno'}>
              <Alumno alumnoId={usuario?.id} />
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
