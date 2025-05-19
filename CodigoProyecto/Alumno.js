import React, { useState } from 'react';

const Alumno = () => {
  const ensayos = JSON.parse(localStorage.getItem('ensayos')) || [];
  const resultados = JSON.parse(localStorage.getItem('resultados')) || [];

  const [activo, setActivo] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [indiceActual, setIndiceActual] = useState(0);

  // Estados para resultados e intentos
  const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null); // para respondidos
  const [intentoSeleccionado, setIntentoSeleccionado] = useState(null); // para respondidos
  const [ensayoDisponibleSeleccionado, setEnsayoDisponibleSeleccionado] = useState(null); // para disponibles

  const seleccionarRespuesta = (pregId, altIdx) => {
    setRespuestas({ ...respuestas, [pregId]: altIdx });
  };

  const enviar = () => {
    const correctas = activo.preguntas.filter(p => respuestas[p.id] === p.correcta).length;

    const resultado = {
      id: Date.now(),
      titulo: activo.titulo,
      preguntas: activo.preguntas,
      respuestas: respuestas,
      puntaje: correctas,
      total: activo.preguntas.length
    };

    const anteriores = JSON.parse(localStorage.getItem('resultados')) || [];
    anteriores.push(resultado);
    localStorage.setItem('resultados', JSON.stringify(anteriores));

    alert(`Respuestas correctas: ${correctas} de ${activo.preguntas.length}`);

    setActivo(null);
    setRespuestas({});
    setIndiceActual(0);
  };

  if (activo) {
  const pregunta = activo.preguntas[indiceActual];

  return (
    <div style={{ display: 'flex', height: '90vh', padding: '20px', maxWidth: '960px', margin: '0 auto', gap: '20px' }}>
      
      {/* Panel principal con la pregunta */}
      <div style={{ flex: 3, border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
        <h2 className="text-2xl font-bold mb-4">{activo.titulo}</h2>
        <p className="mb-2 font-semibold">Pregunta {indiceActual + 1} de {activo.preguntas.length}</p>
        <p className="mb-4">{pregunta.pregunta}</p>
        <div className="mb-4">
          {pregunta.alternativas.map((alt, i) => (
            <button
              key={i}
              onClick={() => seleccionarRespuesta(pregunta.id, i)}
              style={{
                display: 'block',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: respuestas[pregunta.id] === i ? '#3b82f6' : '#e5e7eb',
                color: respuestas[pregunta.id] === i ? '#fff' : '#000',
                borderRadius: '5px',
                border: '1px solid #ccc',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {alt}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {indiceActual > 0 && (
            <button
              onClick={() => setIndiceActual(indiceActual - 1)}
              className="btn bg-gray-400 text-white"
              style={{ padding: '10px 20px', borderRadius: '5px' }}
            >
              Anterior
            </button>
          )}
          {indiceActual < activo.preguntas.length - 1 ? (
            <button
              onClick={() => setIndiceActual(indiceActual + 1)}
              className="btn bg-blue-500 text-white"
              style={{ padding: '10px 20px', borderRadius: '5px' }}
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={enviar}
              className="btn bg-green-600 text-white"
              style={{ padding: '10px 20px', borderRadius: '5px' }}
            >
              Enviar respuestas
            </button>
          )}
        </div>
      </div>

      {/* Panel lateral de navegación por preguntas */}
      <div style={{
        flex: 1,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        overflowY: 'auto'
      }}>
        <h3 className="text-lg font-semibold mb-2 text-center">Navegación</h3>
        {activo.preguntas.map((p, idx) => {
          const respondida = respuestas[p.id] !== undefined;
          return (
            <button
              key={p.id}
              onClick={() => setIndiceActual(idx)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                textAlign: 'center',
                backgroundColor: idx === indiceActual
                  ? '#1d4ed8'
                  : respondida
                  ? '#16a34a'
                  : '#d1d5db',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
              title={`Pregunta ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}


  // Agrupamos resultados por título de ensayo
  const resultadosAgrupados = resultados.reduce((acc, res) => {
    if (!acc[res.titulo]) acc[res.titulo] = [];
    acc[res.titulo].push(res);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Columna izquierda: Ensayos Disponibles */}
      <div style={{
        flex: 1,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        height: '80vh',
        overflowY: 'auto',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ensayos Disponibles</h2>

        {!ensayoDisponibleSeleccionado && (
          ensayos.length === 0 ? (
            <p className="text-center text-gray-600">No hay ensayos aún.</p>
          ) : (
            ensayos.map(e => (
              <button
                key={e.id}
                onClick={() => setEnsayoDisponibleSeleccionado(e)}
                className="btn w-full"
                style={{
                  textAlign: 'left',
                  display: 'block',
                  padding: '12px',
                }}
              >
                {e.titulo}
              </button>
            ))
          )
        )}

        {/* Detalle del ensayo disponible seleccionado */}
        {ensayoDisponibleSeleccionado && (
          <div style={{ marginTop: 'auto' }}>
            <h3 className="text-lg font-semibold mb-2">{ensayoDisponibleSeleccionado.titulo}</h3>
            <p><strong>Asignatura:</strong> {ensayoDisponibleSeleccionado.asignatura || 'No especificada'}</p>
            <p><strong>Descripción:</strong> {ensayoDisponibleSeleccionado.descripcion || 'Sin descripción'}</p>
            <p><strong>Tiempo:</strong> {ensayoDisponibleSeleccionado.tiempo ? `${ensayoDisponibleSeleccionado.tiempo} minutos` : 'No especificado'}</p>
            <p><strong>Número de preguntas:</strong> {ensayoDisponibleSeleccionado.preguntas.length}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                onClick={() => setEnsayoDisponibleSeleccionado(null)}
                className="btn"
                style={{ backgroundColor: '#9ca3af', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}
              >
                Volver
              </button>
              <button
                onClick={() => {
                  setActivo(ensayoDisponibleSeleccionado);
                  setIndiceActual(0);
                  setEnsayoDisponibleSeleccionado(null);
                }}
                className="btn"
                style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}
              >
                Comenzar intento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Columna derecha: Ensayos Respondidos */}
      <div style={{
        flex: 1,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        height: '80vh',
        overflowY: 'auto',
        backgroundColor: '#f3f4f6'
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ensayos Respondidos</h2>

        {!ensayoSeleccionado && !intentoSeleccionado && (
          resultados.length === 0 ? (
            <p className="text-center text-gray-600">No has respondido ensayos todavía.</p>
          ) : (
            Object.entries(resultadosAgrupados).map(([titulo, intentos]) => (
              <button
                key={titulo}
                onClick={() => setEnsayoSeleccionado({ titulo, intentos })}
                className="btn w-full mb-3 text-left"
              >
                {titulo}
              </button>
            ))
          )
        )}

        {/* Mostrar intentos del ensayo seleccionado */}
        {ensayoSeleccionado && !intentoSeleccionado && (
          <div>
            <button
              onClick={() => setEnsayoSeleccionado(null)}
              className="btn mb-4 bg-gray-400 hover:bg-gray-500"
            >
              ← Volver a la lista de ensayos respondidos
            </button>
            <h3 className="text-lg font-semibold mb-2">{ensayoSeleccionado.titulo} - Intentos</h3>
            {ensayoSeleccionado.intentos.map((intento, idx) => (
              <button
                key={intento.id}
                onClick={() => setIntentoSeleccionado(intento)}
                className="btn w-full mb-2 text-left"
              >
                Intento {idx + 1} - Puntaje: {intento.puntaje} / {intento.total}
              </button>
            ))}
          </div>
        )}

        {/* Mostrar detalle del intento seleccionado */}
        {intentoSeleccionado && (
          <div>
            <button
              onClick={() => setIntentoSeleccionado(null)}
              className="btn mb-4 bg-gray-400 hover:bg-gray-500"
            >
              ← Volver a intentos
            </button>
            <h3 className="text-lg font-semibold mb-2">{intentoSeleccionado.titulo}</h3>
            <p className="mb-2 text-sm text-gray-700">
              Puntaje: {intentoSeleccionado.puntaje} / {intentoSeleccionado.total}
            </p>
            {intentoSeleccionado.preguntas.map((p, idx) => {
              const elegida = intentoSeleccionado.respuestas[p.id];
              const correcta = p.correcta;
              return (
                <div key={p.id} className="mb-3">
                  <p className="font-semibold">{idx + 1}. {p.pregunta}</p>
                  {p.alternativas.map((alt, i) => (
                    <p
                      key={i}
                      className={`ml-4 text-sm ${
                        i === correcta
                          ? 'text-green-700 font-bold'
                          : i === elegida
                          ? 'text-red-600 font-bold'
                          : 'text-gray-700'
                      }`}
                    >
                      {i === correcta ? '✔️' : i === elegida ? '❌' : '•'} {alt}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumno;
