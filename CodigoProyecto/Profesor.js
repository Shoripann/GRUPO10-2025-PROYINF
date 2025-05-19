import { useState } from 'react';

const Profesor = () => {
  // Estado para las preguntas
  const [preguntas, setPreguntas] = useState([
    {
      id: 1,
      pregunta: '¿Cuál es la capital de Francia?',
      alternativas: ['Madrid', 'París', 'Roma', 'Berlín'],
      correcta: 1,
      asignatura: 'Historia',
      dificultad: 'Fácil',
    },
    {
      id: 2,
      pregunta: '¿Cuánto es 2 + 2?',
      alternativas: ['3', '4', '5', '6'],
      correcta: 1,
      asignatura: 'Matemáticas',
      dificultad: 'Fácil',
    },
    {
      id: 3,
      pregunta: '¿Qué órgano bombea la sangre?',
      alternativas: ['Cerebro', 'Estómago', 'Corazón', 'Pulmón'],
      correcta: 2,
      asignatura: 'Biología',
      dificultad: 'Media',
    },
    {
      id: 4,
      pregunta: '¿Cuánto es 3 * 3?',
      alternativas: ['6', '3', '9', '33'],
      correcta: 2,
      asignatura: 'Matemáticas',
      dificultad: 'Media',
    },
  ]);

  const [vista, setVista] = useState(null);

  // Función para agregar una nueva pregunta
  const agregarPregunta = (nuevaPregunta) => {
    setPreguntas([...preguntas, { id: Date.now(), ...nuevaPregunta }]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {vista === 'ensayo' ? (
        <CrearEnsayo preguntas={preguntas} volver={() => setVista(null)} />
      ) : vista === 'crearPregunta' ? (
        <CrearPregunta agregarPregunta={agregarPregunta} volver={() => setVista(null)} />
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel del Profesor</h1>

          <button onClick={() => setVista('crearPregunta')} className="btn w-full">
            Crear Pregunta
          </button>

          <button onClick={() => setVista('ensayo')} className="btn w-full">
            Crear Ensayo
          </button>
        </div>
      )}
    </div>
  );
};

const CrearPregunta = ({ volver, agregarPregunta }) => {
  const [pregunta, setPregunta] = useState('');
  const [alternativas, setAlternativas] = useState(['', '', '', '']);
  const [correcta, setCorrecta] = useState(null);
  const [asignatura, setAsignatura] = useState('');
  const [dificultad, setDificultad] = useState('');

  const guardar = () => {
    if (
      !pregunta ||
      alternativas.some((a) => a === '') ||
      correcta === null ||
      !asignatura ||
      !dificultad
    ) {
      alert('Completa todo');
      return;
    }
    agregarPregunta({
      id: Date.now(),
      pregunta,
      alternativas,
      correcta,
      asignatura,
      dificultad,
    });
    alert('Pregunta guardada correctamente');
    setPregunta('');
    setAlternativas(['', '', '', '']);
    setCorrecta(null);
    setAsignatura('');
    setDificultad('');
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: 'auto' }}>
      <h2 className="text-2xl font-semibold mb-4">Nueva Pregunta</h2>

      <input
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        placeholder="Escribe la pregunta"
        className="input mb-4"
      />

      <label
        className="mb-2 font-medium text-gray-700 block"
        style={{ marginBottom: '0.5rem' }}
      >
        Selecciona la alternativa correcta:
      </label>

      {alternativas.map((alt, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <input
            type="text"
            value={alt}
            onChange={(e) => {
              const copia = [...alternativas];
              copia[i] = e.target.value;
              setAlternativas(copia);
            }}
            placeholder={`Alternativa ${i + 1}`}
            style={{
              flexGrow: 1,
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db', 
              marginRight: '1rem',
            }}
          />
          <input
            type="radio"
            name="correcta"
            checked={correcta === i}
            onChange={() => setCorrecta(i)}
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
            }}
            aria-label={`Seleccionar alternativa correcta ${i + 1}`}
          />
        </div>
      ))}

      <label className="block mt-4">Asignatura</label>
      <select
        value={asignatura}
        onChange={(e) => setAsignatura(e.target.value)}
        className="input mb-4"
      >
        <option value="">Selecciona una asignatura</option>
        <option value="Matemáticas">Matemáticas</option>
        <option value="Lenguaje">Lenguaje</option>
        <option value="Biología">Biología</option>
        <option value="Física">Física</option>
        <option value="Química">Química</option>
        <option value="Historia">Historia</option>
      </select>

      <label className="block mb-1">Dificultad</label>
      <select
        value={dificultad}
        onChange={(e) => setDificultad(e.target.value)}
        className="input mb-4"
      >
        <option value="">Selecciona dificultad</option>
        <option value="Fácil">Fácil</option>
        <option value="Media">Media</option>
        <option value="Difícil">Difícil</option>
      </select>

      <div className="flex gap-2">
        <button onClick={guardar} className="btn flex-grow">
          Guardar
        </button>
        <button
          onClick={volver}
          className="btn"
          style={{ backgroundColor: '#6b7280' }}
        >
          Volver
        </button>
      </div>
    </div>
  );
};




const CrearEnsayo = ({ preguntas, volver }) => {
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [asignatura, setAsignatura] = useState('');
  const [maxPreguntas, setMaxPreguntas] = useState(5);
  const [tiempoMinutos, setTiempoMinutos] = useState(30); 

  const preguntasFiltradas = preguntas.filter((p) => p.asignatura === asignatura);

  const agregarPregunta = (id) => {
    if (seleccionadas.includes(id)) return;
    if (seleccionadas.length >= maxPreguntas) return;
    setSeleccionadas([...seleccionadas, id]);
  };

  const eliminarPregunta = (id) => {
    setSeleccionadas(seleccionadas.filter((pid) => pid !== id));
  };

  const guardarEnsayo = () => {
    if (!titulo || seleccionadas.length === 0 || !asignatura || !tiempoMinutos) {
      alert('Agrega un título, selecciona asignatura, preguntas y tiempo.');
      return;
    }
    const ensayo = {
      id: Date.now(),
      titulo,
      tiempoMinutos,
      preguntas: preguntas.filter((p) => seleccionadas.includes(p.id)),
    };
    const existentes = JSON.parse(localStorage.getItem('ensayos')) || [];
    existentes.push(ensayo);
    localStorage.setItem('ensayos', JSON.stringify(existentes));
    alert('Ensayo guardado.');
    volver();
  };

  return (
    <div className="container max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Crear Ensayo</h2>

      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título del ensayo"
        className="input mb-4"
      />

      <label className="block mb-1">Selecciona asignatura</label>
      <select
        value={asignatura}
        onChange={(e) => {
          setAsignatura(e.target.value);
          setSeleccionadas([]);
        }}
        className="input mb-4"
      >
        <option value="">-- Seleccionar asignatura --</option>
        <option value="Matemáticas">Matemáticas</option>
        <option value="Lenguaje">Lenguaje</option>
        <option value="Biología">Biología</option>
        <option value="Física">Física</option>
        <option value="Química">Química</option>
        <option value="Historia">Historia</option>
      </select>
      <label className="block mb-1">Tiempo (minutos)</label>
      <input
        type="number"
        min="1"
        value={tiempoMinutos}
        onChange={(e) => setTiempoMinutos(Number(e.target.value))}
        className="input mb-4"
      />
      <label className="block mb-1">Número máximo de preguntas</label>
      <input
        type="number"
        min="1"
        value={maxPreguntas}
        onChange={(e) => setMaxPreguntas(Number(e.target.value))}
        className="input mb-4"
      />

      

      <label className="block font-semibold mb-1">Agrega la(s) pregunta(s)</label>
      <select
        onChange={(e) => {
          const id = Number(e.target.value);
          if (id) agregarPregunta(id);
          e.target.value = '';
        }}
        className="input mb-4"
        disabled={preguntasFiltradas.length === 0 || seleccionadas.length >= maxPreguntas}
      >
        <option value="">-- Seleccionar pregunta --</option>
        {preguntasFiltradas
          .filter((p) => !seleccionadas.includes(p.id))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.pregunta} (Dificultad: {p.dificultad})
            </option>
          ))}
      </select>

      {preguntasFiltradas.length === 0 && (
        <p className="text-gray-500 mb-4">No hay preguntas disponibles para esta asignatura.</p>
      )}

      {seleccionadas.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Preguntas seleccionadas:</h4>
          <ul className="list-disc ml-6">
            {preguntas
              .filter((p) => seleccionadas.includes(p.id))
              .map((p) => (
                <li key={p.id}>
                  {p.pregunta}{' '}
                  <button
                    onClick={() => eliminarPregunta(p.id)}
                    className="text-red-500 text-sm ml-2 underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      <button onClick={guardarEnsayo} className="btn mt-2 w-full">
        Guardar Ensayo
      </button>
      <button
        onClick={volver}
        className="btn"
        style={{ backgroundColor: '#6b7280', marginLeft: '10px' }}
      >
        Volver
      </button>
    </div>
  );
};


export default Profesor;
