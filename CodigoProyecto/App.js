// App.jsx
import { useState } from 'react';
import Profesor from './Profesor';
import Alumno from './Alumno';
import './index.css';

const App = () => {
  const [modo, setModo] = useState(null);
  const [logueado, setLogueado] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const manejarLogin = () => {
    //cualquier usuario/clave es aceptado
    setLogueado(true);
  };

  return (
    <div className="text-center mt-10">
      {!modo && (
        <div className="card space-y-4">
          <h1 className="text-3xl font-bold">Bienvenido</h1>
          <button onClick={() => setModo('prof')} className="btn">Entrar como Profesor</button>
          <button onClick={() => setModo('alumno')} className="btn">Entrar como Alumno</button>
        </div>
      )}

      {modo && !logueado && (
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
      )}

      {logueado && modo === 'prof' && <Profesor />}
      {logueado && modo === 'alumno' && <Alumno />}
    </div>
  );
};

export default App;
