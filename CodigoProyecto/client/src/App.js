// App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profesor from './Profesor';
import Alumno from './Alumno';
import Resultados from './Resultados';
import './index.css';

const Home = ({ setModo }) => (
  <div className="text-center mt-10">
    <div className="card space-y-4">
      <h1 className="text-3xl font-bold">Bienvenido</h1>
      <button onClick={() => setModo('prof')} className="btn">Entrar como Profesor</button>
      <button onClick={() => setModo('alumno')} className="btn">Entrar como Alumno</button>
    </div>
  </div>
);

const Login = ({ modo, setModo, manejarLogin, username, setUsername, password, setPassword }) => (
  <div className="text-center mt-10">
    <div className="card space-y-2 mt-6">
      <h2 className="text-xl font-semibold">
        Iniciar sesión como {modo === 'prof' ? 'Profesor' : 'Alumno'}
      </h2>
      <input
        className="input"
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="input"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={manejarLogin} className="btn">Iniciar Sesión</button>
      <br />
      <button onClick={() => setModo(null)} className="btn" style={{ backgroundColor: '#888' }}>
        Volver
      </button>
    </div>
  </div>
);

const App = () => {
  const [modo, setModo] = useState(null);
  const [logueado, setLogueado] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const manejarLogin = () => {
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
            ) : !logueado ? (
              <Login
                modo={modo}
                setModo={setModo}
                manejarLogin={manejarLogin}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
              />
            ) : modo === 'prof' ? (
              <Profesor />
            ) : (
              <Alumno />
            )
          }
        />
        <Route path="/profesor" element={<Profesor />} />
        <Route path="/resultados" element={<Resultados />} />
        {/* Aquí puedes agregar más rutas si es necesario */}
      </Routes>
    </Router>
  );
};

export default App;
