import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Profesor from './Profesor';
import Alumno from './Alumno';
import Resultados from './Resultados';
import './index.css';

// Wrapper para Alumno que extrae el ID desde location.state
const AlumnoWrapper = () => {
  const location = useLocation();
  const alumno = location.state?.user;

  if (!alumno) {
    return <p>Error: No se encontró información del alumno.</p>;
  }

  return <Alumno alumnoId={alumno.id} />;
};

// Wrapper para Profesor que extrae el usuario desde location.state
const ProfesorWrapper = () => {
  const location = useLocation();
  const profesor = location.state?.user;

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
const Login = ({ modo, setModo, setLogueado, setUsername, setPassword }) => {
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      if (!data.role || !data.user) {
        throw new Error('Respuesta del servidor inválida');
      }

      setUsername(userInput);
      setPassword(passInput);
      setLogueado(true);

      if (data.role === 'profesor') {
        navigate('/profesor', {
          state: {
            user: data.user,
            authToken: 'simulated-token'
          }
        });
      } else if (data.role === 'alumno') {
        navigate('/alumno', {
          state: {
            user: data.user,
            authToken: 'simulated-token'
          }
        });
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

// Ruta protegida
const RutaPrivada = ({ logueado, children }) => {
  return logueado ? children : <Navigate to="/" />;
};

// App principal
const App = () => {
  const [modo, setModo] = useState(null);
  const [logueado, setLogueado] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
                setLogueado={setLogueado}
                setUsername={setUsername}
                setPassword={setPassword}
              />
            )
          }
        />

        <Route
          path="/profesor"
          element={
            <RutaPrivada logueado={logueado}>
              <ProfesorWrapper />
            </RutaPrivada>
          }
        />

        <Route
          path="/alumno"
          element={
            <RutaPrivada logueado={logueado}>
              <Alumno alumnoId={1} />
            </RutaPrivada>
          }
        />

        <Route
          path="/resultados"
          element={
            <RutaPrivada logueado={logueado}>
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
