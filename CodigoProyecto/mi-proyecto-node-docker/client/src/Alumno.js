import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Alumno = ({ alumnoId }) => {
  const [ensayosDisponibles, setEnsayosDisponibles] = useState([]);
  const [ensayosRealizados, setEnsayosRealizados] = useState([]);
  const [resultados, setResultados] = useState([]);

  const [ensayoActivo, setEnsayoActivo] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [indiceActual, setIndiceActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const intervalRef = useRef(null);

  // Estados para navegación
  const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null);
  const [intentoSeleccionado, setIntentoSeleccionado] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener ensayos disponibles (sin alumno asignado)
        const resDisponibles = await axios.get('http://localhost:3000/api/ensayos/disponibles');
        setEnsayosDisponibles(resDisponibles.data);

        // Obtener ensayos realizados por el alumno
        console.log(alumnoId)
        const resRealizados = await axios.get(`http://localhost:3000/api/resultados/alumno/${alumnoId}`);
        setEnsayosRealizados(resRealizados.data);

        // Obtener resultados del alumno
        const resResultados = await axios.get(`http://localhost:3000/api/resultados/alumno/${alumnoId}`);
        setResultados(resResultados.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, [alumnoId]);

  // Temporizador
  const iniciarTemporizador = (minutos) => {
    const segundos = minutos * 60;;
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
      // Obtener preguntas del ensayo con sus opciones
      const res = await axios.get(`http://localhost:3000/api/ensayos/${ensayo.id}/preguntas`);
      

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
      // Calcular puntaje
      let correctas = 0;
      ensayoActivo.preguntas.forEach(pregunta => {
        const respuestaSeleccionada = respuestas[pregunta.id];
        if (respuestaSeleccionada !== undefined && 
            pregunta.opciones[respuestaSeleccionada].esCorrecta) {
          correctas++;
        }
      });

      const puntaje = (correctas / ensayoActivo.preguntas.length) * 100;

      // Guardar resultado
      await axios.post('http://localhost:3000/api/resultados', {
        ensayo_id: ensayoActivo.id,
        alumno_id: alumnoId,
        puntaje: puntaje,
        respuestas: JSON.stringify(respuestas)
      });

      // Actualizar lista de ensayos realizados
      const res = await axios.get(`http://localhost:3000/api/ensayos/alumno/${alumnoId}`);
      setEnsayosRealizados(res.data);

      // Limpiar estado
      setEnsayoActivo(null);
      setRespuestas({});
      setIndiceActual(0);
      setTiempoRestante(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      alert(`Has respondido ${correctas} de ${ensayoActivo.preguntas.length} correctamente (${puntaje.toFixed(2)}%)`);
    } catch (error) {
      console.error('Error al enviar respuestas:', error);
      alert('Error al guardar el resultado');
    }
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Formatear tiempo
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
        {/* Panel principal */}
        <div style={{ flex: 3, border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          {tiempoRestante !== null && (
            <div style={{
              backgroundColor: tiempoRestante <= 60 ? '#fee2e2' : '#ecfdf5',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: tiempoRestante <= 60 ? '#dc2626' : '#065f46'
            }}>
              Tiempo restante: {formatTiempo(tiempoRestante)}
            </div>
          )}
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {ensayoActivo.titulo}
          </h2>
          
          <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
            Pregunta {indiceActual + 1} de {ensayoActivo.preguntas.length}
          </p>
          
          <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {preguntaActual.texto}
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            {preguntaActual.opciones.map((opcion, index) => (
              <button
                key={opcion.id}
                onClick={() => seleccionarRespuesta(preguntaActual.id, index)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginBottom: '10px',
                  textAlign: 'left',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: respuestas[preguntaActual.id] === index ? '#3b82f6' : '#f9fafb',
                  color: respuestas[preguntaActual.id] === index ? 'white' : '#333',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button
              onClick={() => setIndiceActual(prev => Math.max(0, prev - 1))}
              disabled={indiceActual === 0}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                backgroundColor: '#e5e7eb',
                color: '#4b5563',
                border: 'none',
                cursor: 'pointer',
                opacity: indiceActual === 0 ? 0.5 : 1
              }}
            >
              Anterior
            </button>
            
            {indiceActual < ensayoActivo.preguntas.length - 1 ? (
              <button
                onClick={() => setIndiceActual(prev => prev + 1)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={enviarRespuestas}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Enviar respuestas
              </button>
            )}
          </div>
        </div>
        
        {/* Panel de navegación */}
        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
            Navegación
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {ensayoActivo.preguntas.map((pregunta, index) => (
              <button
                key={pregunta.id}
                onClick={() => setIndiceActual(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: index === indiceActual 
                    ? '#1d4ed8' 
                    : respuestas[pregunta.id] !== undefined 
                      ? '#10b981' 
                      : '#e5e7eb',
                  color: index === indiceActual || respuestas[pregunta.id] !== undefined 
                    ? 'white' 
                    : '#4b5563',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                title={`Pregunta ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
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
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  ':hover': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }
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
        
        {ensayosRealizados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No has realizado ningún ensayo aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ensayosRealizados.map(ensayo => {
              return(
              <div 
                key={ensayo.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => setEnsayoSeleccionado({ ensayo })}
              >
                <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{ensayo.titulo}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  {ensayo.asignatura || 'Sin asignatura especificada'}
                </p>
                <p style={{ 
                  color: ensayo.puntaje >= 70 ? '#10b981' : '#ef4444',
                  fontWeight: '500'
                }}>
                  Puntaje: {ensayo.puntaje?.toFixed(2) || 0}%
                </p>
              </div>
              );
            })}
          </div>
        )}
        
        {/* Detalle del ensayo seleccionado */}
        {ensayoSeleccionado && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem'
              }}>
                {ensayoSeleccionado.ensayo.titulo}
              </h3>
              
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Asignatura:</strong> {ensayoSeleccionado.ensayo.asignatura || 'No especificada'}
              </p>
              
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Fecha:</strong> {new Date(ensayoSeleccionado.ensayo.fecha).toLocaleDateString()}
              </p>
              
              {ensayoSeleccionado.resultado && (
                <>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Puntaje:</strong> {ensayoSeleccionado.resultado.puntaje.toFixed(2)}%
                  </p>
                  
                  <p style={{ marginBottom: '1.5rem' }}>
                    <strong>Fecha de realización:</strong> {new Date(ensayoSeleccionado.resultado.fecha).toLocaleDateString()}
                  </p>
                </>
              )}
              
              <button
                onClick={() => setEnsayoSeleccionado(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumno;