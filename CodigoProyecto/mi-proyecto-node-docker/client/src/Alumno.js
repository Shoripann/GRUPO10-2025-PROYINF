import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Alumno = ({ alumnoId }) => {
  const [ensayosDisponibles, setEnsayosDisponibles] = useState([]);
  const [ensayosRealizados, setEnsayosRealizados] = useState([]);

  const [ensayoActivo, setEnsayoActivo] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [indiceActual, setIndiceActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [cursoId, setCursoId] = useState(null);


  const intervalRef = useRef(null);

  // Estados para navegación
  const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null);
  const navigate = useNavigate();

  // Cargar datos iniciales
useEffect(() => {
  const cargarDatos = async () => {
    try {
      // 🔹 1) Traer los datos del alumno (para conocer su curso_id)
      const resAlumno = await axios.get(`/api/alumnos/${alumnoId}`);
      const curso = resAlumno?.data?.curso_id ?? resAlumno?.data?.cursoId ?? null;
      setCursoId(curso);

      // 🔹 2) Luego cargar ensayos disponibles solo si ya tenemos curso_id
      if (curso) {
        const resDisponibles = await axios.get('/api/ensayos/disponibles', {
          params: { curso_id: Number(curso) }
        });
        setEnsayosDisponibles(resDisponibles.data);
      }

      // 🔹 3) Ensayos realizados y resultados
      const resRealizados = await axios.get(`/api/ensayos/alumno/${alumnoId}`);
      setEnsayosRealizados(resRealizados.data);

      const resResultados = await axios.get(`/api/resultados/${alumnoId}`);
      setResultados(resResultados.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  cargarDatos();
}, [alumnoId]);


  // Temporizador
  const iniciarTemporizador = (minutos) => {
    const segundos = minutos * 60;
    setTiempoRestante(segundos);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          tiempoTerminado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const tiempoTerminado = () => {
    alert('¡Tiempo terminado! Enviando respuestas...');
    enviarRespuestas();
  };

  // Comenzar un ensayo
  const comenzarEnsayo = async (ensayo) => {
    try {
      const res = await axios.get(`/api/ensayos/${ensayo.id}/preguntas`);

      setEnsayoActivo({
        ...ensayo,
        preguntas: res.data.map(p => ({
          id: p.id,
          texto: p.texto,
          opciones: p.opciones.map((o, index) => ({
            id: o.id,
            texto: o.texto,
            esCorrecta: o.es_correcta === true || o.esCorrecta === true,
            index
          }))
        }))
      });

      setIndiceActual(0);
      setRespuestas({});

      if (ensayo.tiempoMinutos) {
        iniciarTemporizador(ensayo.tiempoMinutos);
      }
    } catch (error) {
      console.error('Error al comenzar ensayo:', error);
      alert('Error al cargar el ensayo');
    }
  };

  const seleccionarRespuesta = (preguntaId, opcionIndex) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: opcionIndex
    }));
  };

  const enviarRespuestas = async () => {
    if (!ensayoActivo) return;

    try {
      const preguntas = ensayoActivo.preguntas;
      const seleccionMap = respuestas;

      const total = preguntas.length;
      let correctas = 0;
      preguntas.forEach((p) => {
        const correctaIdx = p.opciones.findIndex(o => o.esCorrecta === true);
        if (seleccionMap[p.id] === correctaIdx) correctas++;
      });
      const puntaje = total > 0 ? +(correctas * 100 / total).toFixed(2) : 0;

      await axios.post('/api/resultados', {
        ensayo_id: ensayoActivo.id,
        alumno_id: alumnoId,
        puntaje,
        respuestas: seleccionMap
      });

      const res = await axios.get(`/api/ensayos/alumno/${alumnoId}`);
      setEnsayosRealizados(res.data);

      setEnsayoActivo(null);
      setRespuestas({});
      setIndiceActual(0);
      setTiempoRestante(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      alert(`Has respondido ${correctas} de ${preguntas.length} correctamente (${puntaje.toFixed(2)}%)`);
    } catch (error) {
      console.error('Error al enviar respuestas:', error);
      alert('Error al guardar el resultado');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString();
  } catch {
    return String(fecha);
  }
};

const fmtPuntaje = (p) => {
  if (p === null || p === undefined) return '—';
  const n = Number(p);
  return Number.isFinite(n) ? `${n.toFixed(2)} pts` : String(p);
};


  // Vista de ensayo activo
  // Vista de ensayo activo
if (ensayoActivo) {
  const preguntaActual = ensayoActivo.preguntas[indiceActual];

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '10px' }}>{ensayoActivo.titulo}</h2>

      {tiempoRestante !== null && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Tiempo restante: {formatTiempo(tiempoRestante)}
        </p>
      )}

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        backgroundColor: '#fff'
      }}>
        <h3 style={{ marginBottom: '10px' }}>
          {preguntaActual.texto}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {preguntaActual.opciones.map((opcion, index) => (
            <button
              key={opcion.id}
              onClick={() => seleccionarRespuesta(preguntaActual.id, index)}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: respuestas[preguntaActual.id] === index ? '#2563eb' : '#f3f4f6',
                color: respuestas[preguntaActual.id] === index ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setIndiceActual(prev => Math.max(prev - 1, 0))}
          disabled={indiceActual === 0}
          style={{ padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Anterior
        </button>

        {indiceActual < ensayoActivo.preguntas.length - 1 ? (
          <button
            onClick={() => setIndiceActual(prev => prev + 1)}
            style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer' }}
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={enviarRespuestas}
            style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer' }}
          >
            Enviar respuestas
          </button>
        )}
      </div>
    </div>
  );
}


  // Vista principal (sin ensayo activo)
  return (
    <div style={{
      display: 'flex',
      padding: '20px',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '80vh'
    }}>
      {/* Ensayos disponibles */}
      <div style={{
        flex: 1,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Ensayos Disponibles
        </h2>

        {ensayosDisponibles.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No hay ensayos disponibles actualmente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ensayosDisponibles.map(ensayo => (
              <div
                key={ensayo.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => comenzarEnsayo(ensayo)}
              >
                <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{ensayo.titulo}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  {ensayo.asignatura || 'Sin asignatura especificada'}
                </p>
                {ensayo.tiempoMinutos && (
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    Tiempo: {ensayo.tiempoMinutos} minutos
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Preguntas: {ensayo.num_preguntas}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 🚀 Nuevo botón Banco */}
        <button
          onClick={() => navigate('/banco')}
          style={{
            marginTop: '1rem',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            fontWeight: '600'
          }}
        >
          Banco de Preguntas
        </button>
      </div>

      {/* Ensayos realizados */}
      <div style={{
        flex: 1,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f3f4f6'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Ensayos Realizados
        </h2>

        {/* Ensayos realizados */}
{ensayosRealizados.length === 0 ? (
  <p style={{ textAlign: 'center', color: '#6b7280' }}>
    Aún no tienes ensayos realizados.
  </p>
) : (
  <div style={{ display: 'grid', gap: 12 }}>
    {ensayosRealizados.map((r) => (
      <div
        key={r.id ?? `${r.ensayo_id}-${r.fecha}`}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          background: '#fff',
          padding: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>
            {r.titulo || `Ensayo #${r.ensayo_id ?? r.id}`}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            {(r.asignatura ? `${r.asignatura} • ` : '') + formatFecha(r.fecha)}
          </div>
        </div>

        <div style={{
          fontWeight: 700,
          padding: '6px 10px',
          borderRadius: 6,
          background: '#f3f4f6',
          minWidth: 90,
          textAlign: 'center'
        }}>
          {fmtPuntaje(r.puntaje)}
        </div>
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
};

export default Alumno;
