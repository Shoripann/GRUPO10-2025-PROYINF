import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profesor = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [vista, setVista] = useState(null);
  const navigate = useNavigate();

  // Cargar preguntas
  useEffect(() => {
    axios.get('/api/preguntas')
      .then(res => {
        const normalizadas = res.data.map(p => {
          const asig = (p.asignatura ?? p.materia ?? '').trim();
          return {
            ...p,
            asignatura: asig,
            materia: asig, 
          };
        });
        setPreguntas(normalizadas);
      })
      .catch(err => console.error('Error al cargar preguntas:', err));
  }, []);

  // Guarda en BD y actualiza el estado local
  const agregarPregunta = async (nuevaPregunta) => {
    try {
      // 1) Guardar la pregunta
      const res = await axios.post('/api/preguntas', {
        texto: nuevaPregunta.pregunta,
        dificultad: nuevaPregunta.dificultad,
        materia: nuevaPregunta.asignatura, 
        profesor_id: 1,
        es_banco: Boolean(nuevaPregunta.es_banco)
      });
      const preguntaId = res.data.id;

      // 2) Guardar alternativas
      for (let i = 0; i < nuevaPregunta.alternativas.length; i++) {
        await axios.post('/api/opciones', {
          pregunta_id: preguntaId,
          texto: nuevaPregunta.alternativas[i],
          es_correcta: i === nuevaPregunta.correcta
        });
      }

      // 3) Actualizar estado local
      const asig = (nuevaPregunta.asignatura || '').trim();
      const nueva = {
        id: preguntaId,
        texto: nuevaPregunta.pregunta,
        pregunta: nuevaPregunta.pregunta,
        alternativas: nuevaPregunta.alternativas,
        correcta: nuevaPregunta.correcta,
        dificultad: nuevaPregunta.dificultad,
        asignatura: asig,
        materia: asig,
        es_banco: Boolean(nuevaPregunta.es_banco)
      };

      setPreguntas(prev => [...prev, nueva]);
      alert('✅ Pregunta guardada correctamente');
    } catch (err) {
      console.error('❌ Error al guardar la pregunta:', err);
      alert('Error al guardar la pregunta');
    }
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
          <button
            onClick={() => navigate('/resultados')}
            className="btn w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Ver Resultados
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
  const [esBanco, setEsBanco] = useState(false);

  const guardar = async () => {
    if (!pregunta || alternativas.some((a) => a === '') || correcta === null || !asignatura || !dificultad) {
      alert('Completa todo');
      return;
    }

    try {
      await agregarPregunta({
        pregunta,
        alternativas,
        correcta,
        asignatura,
        dificultad,
        es_banco: esBanco
      });

      // Limpiar formulario
      setPregunta('');
      setAlternativas(['', '', '', '']);
      setCorrecta(null);
      setAsignatura('');
      setDificultad('');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la pregunta');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: 'auto' }}>
      <h2 className="text-2xl font-semibold mb-4">Nueva Pregunta</h2>
      <input value={pregunta} onChange={(e) => setPregunta(e.target.value)} placeholder="Escribe la pregunta" className="input mb-4" />

      <label className="mb-2 font-medium text-gray-700 block">Selecciona la alternativa correcta:</label>
      {alternativas.map((alt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="text"
            value={alt}
            onChange={(e) => {
              const copia = [...alternativas];
              copia[i] = e.target.value;
              setAlternativas(copia);
            }}
            placeholder={`Alternativa ${i + 1}`}
            style={{ flexGrow: 1, padding: '0.5rem', fontSize: '1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', marginRight: '1rem' }}
          />
          <input type="radio" name="correcta" checked={correcta === i} onChange={() => setCorrecta(i)} style={{ width: '20px', height: '20px' }} />
        </div>
      ))}

      <label className="block mt-4">Asignatura</label>
      <select value={asignatura} onChange={(e) => setAsignatura(e.target.value)} className="input mb-4">
        <option value="">Selecciona una asignatura</option>
        <option value="Matemáticas">Matemáticas</option>
        <option value="Lenguaje">Lenguaje</option>
        <option value="Biología">Biología</option>
        <option value="Física">Física</option>
        <option value="Química">Química</option>
        <option value="Historia">Historia</option>
      </select>

      <label className="block mb-1">Dificultad</label>
      <select value={dificultad} onChange={(e) => setDificultad(e.target.value)} className="input mb-4">
        <option value="">Selecciona dificultad</option>
        <option value="Fácil">Fácil</option>
        <option value="Media">Media</option>
        <option value="Difícil">Difícil</option>
      </select>

      <label className="felx items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={esBanco}
          onChange={(e) => setEsBanco(e.target.checked)}
        />
        Enviar al banco de preguntas
      </label>

      <div className="flex gap-2">
        <button onClick={guardar} className="btn flex-grow">Guardar</button>
        <button onClick={volver} className="btn" style={{ backgroundColor: '#6b7280' }}>Volver</button>
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

  // Filtro robusto: compara normalizado
  const preguntasFiltradas = preguntas.filter(
    p => (p.asignatura ?? p.materia ?? '').trim() === (asignatura ?? '').trim()
  );

  const agregarPreguntaId = (id) => {
    if (seleccionadas.includes(id) || seleccionadas.length >= maxPreguntas) return;
    setSeleccionadas(prev => [...prev, id]);
  };

  const eliminarPregunta = (id) => {
    setSeleccionadas(prev => prev.filter(pid => pid !== id));
  };

  const guardarEnsayo = async () => {
    if (!titulo || seleccionadas.length === 0 || !asignatura || !tiempoMinutos) {
      alert('Agrega un título, selecciona asignatura, preguntas y tiempo.');
      return;
    }

    try {
      await axios.post('/api/ensayos', {
        titulo,
        asignatura,
        tiempoMinutos,
        preguntas: seleccionadas
      });

      alert('Ensayo guardado en base de datos.');
      volver();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el ensayo');
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Crear Ensayo</h2>

      <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del ensayo" className="input mb-4" />
      <label className="block mb-1">Selecciona asignatura</label>
      <select
        value={asignatura}
        onChange={(e) => { setAsignatura(e.target.value); setSeleccionadas([]); }}
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
      <input type="number" min="1" value={tiempoMinutos} onChange={(e) => setTiempoMinutos(Number(e.target.value))} className="input mb-4" />
      <label className="block mb-1">Número máximo de preguntas</label>
      <input type="number" min="1" value={maxPreguntas} onChange={(e) => setMaxPreguntas(Number(e.target.value))} className="input mb-4" />

      <label className="block font-semibold mb-1">Agrega la(s) pregunta(s)</label>
      <select
        onChange={(e) => {
          const id = Number(e.target.value);
          if (id) agregarPreguntaId(id);
          e.target.value = '';
        }}
        className="input mb-4"
        disabled={preguntasFiltradas.length === 0 || seleccionadas.length >= maxPreguntas}
      >
        <option value="">-- Seleccionar pregunta --</option>
        {preguntasFiltradas.filter((p) => !seleccionadas.includes(p.id)).map((p) => (
          <option key={p.id} value={p.id}>
            {(p.texto || p.pregunta)} (Dificultad: {p.dificultad})
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
            {preguntas.filter((p) => seleccionadas.includes(p.id)).map((p) => (
              <li key={p.id}>
                {(p.pregunta || p.texto)}
                <button onClick={() => eliminarPregunta(p.id)} className="text-red-500 text-sm ml-2 underline">
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={guardarEnsayo} className="btn mt-2 w-full">Guardar Ensayo</button>
      <button onClick={volver} className="btn" style={{ backgroundColor: '#6b7280', marginLeft: '10px' }}>Volver</button>
    </div>
  );
};

export default Profesor;
