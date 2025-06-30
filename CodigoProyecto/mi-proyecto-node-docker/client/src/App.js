// App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Profesor from './Profesor';
import Alumno from './Alumno';
import Resultados from './Resultados';
import './index.css';

// Página de inicio: elige entre Profesor o Alumno
const Home = ({ setModo }) => (
  <div className="text-center mt-10">
    <div className="card space-y-4">
      <h1 className="text-3xl font-bold">Bienvenido</h1>
      <button onClick={() => setModo('prof')} className="btn">Entrar como Profesor</button>
      <button onClick={() => setModo('alumno')} className="btn">Entrar como Alumno</button>
    </div>
  </div>
);

// Página de login: 
const Login = ({ modo, setModo, setLogueado, setUsername, setPassword }) => {
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const navigate = useNavigate();

  const manejarLogin = () => {
    setUsername(userInput);
    setPassword(passInput);
    setLogueado(true);
    if (modo === 'prof') navigate('/profesor');
    else navigate('/alumno');
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
          placeholder="Usuario"
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


const RutaPrivada = ({ logueado, children }) => {
  return logueado ? children : <Navigate to="/" />;
};

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
              <Profesor username={username} />
            </RutaPrivada>
          }
        />

        <Route
          path="/alumno"
          element={
            <RutaPrivada logueado={logueado}>
              <Alumno username={username} />
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
