import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RevisionEnsayo = ({ ensayoId, alumnoId, onVolver }) => {
  const [revision, setRevision] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRevision();
  }, [ensayoId, alumnoId]);

  const cargarRevision = async () => {
    try {
      setCargando(true);
      const res = await axios.get(`/api/ensayos/${ensayoId}/revision/${alumnoId}`);
      setRevision(res.data);
      setError(null);
    } catch (err) {
      console.error('Error cargando revisión:', err);
      setError('No se pudo cargar la revisión del ensayo');
    } finally {
      setCargando(false);
    }
  };

  // Función segura para formatear puntaje
  const formatPuntaje = (puntaje) => {
    if (puntaje === null || puntaje === undefined) return '0.00';
    const num = Number(puntaje);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Función segura para contar respuestas correctas
  const contarCorrectas = (preguntas) => {
    if (!preguntas || !Array.isArray(preguntas)) return 0;
    return preguntas.filter(p => p.seleccionadaIndex === p.correctaIndex).length;
  };

  if (cargando) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Cargando revisión...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error</h3>
          <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={onVolver}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!revision) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <p style={{ color: '#6b7280' }}>No se encontraron datos de revisión.</p>
        <button
          onClick={onVolver}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  const { meta, preguntas } = revision;
  const preguntasArray = Array.isArray(preguntas) ? preguntas : [];
  const totalPreguntas = preguntasArray.length;
  const correctas = contarCorrectas(preguntasArray);

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Revisión de Ensayo
            </h1>
            <p style={{ color: '#64748b' }}>
              Fecha: {meta?.fecha ? new Date(meta.fecha).toLocaleDateString() : 'No disponible'}
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '4px' }}>
              Puntaje Final
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#0369a1'
            }}>
              {formatPuntaje(meta?.puntaje)}%
            </div>
          </div>
        </div>

        <button
          onClick={onVolver}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ← Volver a mis ensayos
        </button>
      </div>

      {/* Preguntas */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {preguntasArray.map((pregunta, index) => {
          const respuestaCorrecta = pregunta.seleccionadaIndex === pregunta.correctaIndex;
          
          return (
            <div
              key={pregunta.id || index}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                border: `2px solid ${respuestaCorrecta ? '#10b981' : '#ef4444'}`
              }}
            >
              {/* Header de la pregunta */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  Pregunta {index + 1}
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: respuestaCorrecta ? '#dcfce7' : '#fef2f2',
                    color: respuestaCorrecta ? '#166534' : '#991b1b'
                  }}>
                    {respuestaCorrecta ? '✅ Correcta' : '❌ Incorrecta'}
                  </span>
                </div>
              </div>

              {/* Texto de la pregunta */}
              <div style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#334155',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                {pregunta.texto || 'Pregunta sin texto'}
              </div>

              {/* Opciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(pregunta.opciones || []).map((opcion, opcionIndex) => {
                  const esSeleccionada = opcion.seleccionada;
                  const esCorrecta = opcion.es_correcta;
                  
                  let backgroundColor = '#ffffff';
                  let borderColor = '#e2e8f0';
                  let color = '#1e293b';
                  
                  if (esSeleccionada && esCorrecta) {
                    backgroundColor = '#dcfce7';
                    borderColor = '#22c55e';
                    color = '#166534';
                  } else if (esSeleccionada && !esCorrecta) {
                    backgroundColor = '#fef2f2';
                    borderColor = '#ef4444';
                    color = '#991b1b';
                  } else if (esCorrecta) {
                    backgroundColor = '#f0f9ff';
                    borderColor = '#0ea5e9';
                    color = '#0369a1';
                  }

                  return (
                    <div
                      key={opcion.id || opcionIndex}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: `2px solid ${borderColor}`,
                        backgroundColor,
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `2px solid ${color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + opcionIndex)}
                      </div>
                      
                      <span style={{ flex: 1 }}>{opcion.texto || 'Opción sin texto'}</span>
                      
                      {/* Indicadores */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {esSeleccionada && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: esCorrecta ? '#22c55e' : '#ef4444',
                            color: 'white'
                          }}>
                            TU RESPUESTA
                          </span>
                        )}
                        
                        {esCorrecta && !esSeleccionada && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#0ea5e9',
                            color: 'white'
                          }}>
                            CORRECTA
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explicación del resultado */}
              {!respuestaCorrecta && pregunta.correctaIndex !== undefined && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px'
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: '#991b1b',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    <strong>Retroalimentación:</strong> Tu respuesta fue incorrecta. 
                    La opción correcta es la {String.fromCharCode(65 + pregunta.correctaIndex)}.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen final */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Resumen del Ensayo</h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {correctas}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Correctas</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {totalPreguntas - correctas}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Incorrectas</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {totalPreguntas}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionEnsayo;