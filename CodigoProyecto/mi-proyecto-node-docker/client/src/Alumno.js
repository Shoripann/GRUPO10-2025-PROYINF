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

  const intervalRef = useRef(null);

  // Estados para navegación
  const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null);
  const navigate = useNavigate();

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resDisponibles = await axios.get('/api/ensayos/disponibles');
        setEnsayosDisponibles(resDisponibles.data);

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

  // Vista de ensayo activo
  if (ensayoActivo) {
    const preguntaActual = ensayoActivo.preguntas[indiceActual];

    return (
      <div style={{ display: 'flex', height: '90vh', padding: '20px', maxWidth: '1200px', margin: '0 auto', gap: '20px' }}>
        {/* ... el resto igual */}
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

        {/* ... el resto igual */}
      </div>
    </div>
  );
};

export default Alumno;
