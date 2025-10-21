import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RevisionEnsayo from './RevisionEnsayo';

const Alumno = ({ alumnoId }) => {
  const [ensayosDisponibles, setEnsayosDisponibles] = useState([]);
  const [ensayosRealizados, setEnsayosRealizados] = useState([]);
  const [ensayoActivo, setEnsayoActivo] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [indiceActual, setIndiceActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [cursoId, setCursoId] = useState(null);
  const [modoRevision, setModoRevision] = useState(false);
  const [ensayoRevision, setEnsayoRevision] = useState(null);

  const intervalRef = useRef(null);
  const navigate = useNavigate();

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resAlumno = await axios.get(`/api/alumnos/${alumnoId}`);
        const curso = resAlumno?.data?.curso_id ?? null;
        setCursoId(curso);

        if (curso) {
          const resDisponibles = await axios.get('/api/ensayos/disponibles', {
            params: { curso_id: Number(curso) }
          });
          setEnsayosDisponibles(resDisponibles.data);
        }

        const resRealizados = await axios.get(`/api/ensayos/alumno/${alumnoId}`);
        setEnsayosRealizados(resRealizados.data);
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
            esCorrecta: o.es_correcta === true,
            index
          }))
        }))
      });

      setIndiceActual(0);
      setRespuestas({});

      const tiempoEnMinutos = ensayo.tiempoMinutos;
      if (tiempoEnMinutos) {
        iniciarTemporizador(tiempoEnMinutos);
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

  // Ver revisión de ensayo
  const verRevision = (ensayo) => {
    setEnsayoRevision(ensayo);
    setModoRevision(true);
  };

  // Limpiar intervalo al desmontar
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

  // Modo revisión
  if (modoRevision && ensayoRevision) {
    return (
      <RevisionEnsayo
        ensayoId={ensayoRevision.id}
        alumnoId={alumnoId}
        onVolver={() => {
          setModoRevision(false);
          setEnsayoRevision(null);
        }}
      />
    );
  }

  // Vista de ensayo activo
  if (ensayoActivo) {
    const preguntaActual = ensayoActivo.preguntas[indiceActual];
    const totalPreguntas = ensayoActivo.preguntas.length;

    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Panel lateral de navegación */}
        <div style={{
          width: '250px',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#1e293b', fontWeight: '600' }}>
            Navegación
          </h3>
          
          {/* Tiempo */}
          <div style={{
            backgroundColor: tiempoRestante < 300 ? '#fef2f2' : '#f0f9ff',
            border: `2px solid ${tiempoRestante < 300 ? '#fecaca' : '#bae6fd'}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
              Tiempo restante
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: tiempoRestante < 300 ? '#dc2626' : '#0369a1',
              fontFamily: 'monospace'
            }}>
              {formatTiempo(tiempoRestante)}
            </div>
          </div>

          {/* Grid de preguntas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {ensayoActivo.preguntas.map((pregunta, index) => {
              const estaRespondida = respuestas.hasOwnProperty(pregunta.id);
              const esActual = index === indiceActual;
              
              let backgroundColor = '#f1f5f9';
              let color = '#64748b';
              let borderColor = '#e2e8f0';

              if (esActual) {
                backgroundColor = '#3b82f6';
                color = 'white';
                borderColor = '#3b82f6';
              } else if (estaRespondida) {
                backgroundColor = '#10b981';
                color = 'white';
                borderColor = '#10b981';
              }

              return (
                <button
                  key={pregunta.id}
                  onClick={() => setIndiceActual(index)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    border: `2px solid ${borderColor}`,
                    backgroundColor,
                    color,
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Estadísticas */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>Progreso</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Respondidas:</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>
                {Object.keys(respuestas).length}/{totalPreguntas}
              </span>
            </div>
          </div>

          <button
            onClick={enviarRespuestas}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Finalizar Ensayo
          </button>
        </div>

        {/* Área principal */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                Pregunta {indiceActual + 1} de {totalPreguntas}
              </h2>
              <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                {ensayoActivo.asignatura}
              </div>
            </div>

            {/* Pregunta */}
            <div style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: '#334155',
              marginBottom: '30px',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              borderLeft: '4px solid #3b82f6'
            }}>
              {preguntaActual.texto}
            </div>

            {/* Opciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {preguntaActual.opciones.map((opcion, index) => {
                const estaSeleccionada = respuestas[preguntaActual.id] === index;
                
                return (
                  <button
                    key={opcion.id}
                    onClick={() => seleccionarRespuesta(preguntaActual.id, index)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: `2px solid ${estaSeleccionada ? '#3b82f6' : '#e2e8f0'}`,
                      backgroundColor: estaSeleccionada ? '#eff6ff' : 'white',
                      color: '#1e293b',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${estaSeleccionada ? '#3b82f6' : '#cbd5e1'}`,
                      backgroundColor: estaSeleccionada ? '#3b82f6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: estaSeleccionada ? 'white' : '#64748b',
                      fontWeight: '600'
                    }}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    {opcion.texto}
                  </button>
                );
              })}
            </div>

            {/* Navegación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setIndiceActual(prev => Math.max(prev - 1, 0))}
                disabled={indiceActual === 0}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: indiceActual === 0 ? '#f3f4f6' : 'white',
                  color: indiceActual === 0 ? '#9ca3af' : '#374151',
                  cursor: indiceActual === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Anterior
              </button>

              <button
                onClick={() => setIndiceActual(prev => Math.min(prev + 1, totalPreguntas - 1))}
                disabled={indiceActual === totalPreguntas - 1}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  cursor: indiceActual === totalPreguntas - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: indiceActual === totalPreguntas - 1 ? 0.5 : 1
                }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal
  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      {/* Ensayos disponibles */}
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '16px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
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
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Tiempo: {ensayo.tiempoMinutos} minutos
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Preguntas: {ensayo.num_preguntas}
                </p>
              </div>
            ))}
          </div>
        )}

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
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '16px', backgroundColor: '#f3f4f6' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          Ensayos Realizados
        </h2>

        {ensayosRealizados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Aún no tienes ensayos realizados.</p>
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
                <div style={{ flex: 1 }}>
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
                  textAlign: 'center',
                  marginRight: '12px'
                }}>
                  {fmtPuntaje(r.puntaje)}
                </div>

                <button
                  onClick={() => verRevision(r)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Ver Revisión
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumno;
