import React, { useState, useMemo } from 'react';
import './Resultados.css';  // Importa el CSS aquí

const Resultados = () => {
  const resultados = useMemo(() => {
    return JSON.parse(localStorage.getItem('resultados')) || []
  }, []);
  const resultadosPorEnsayo = useMemo(() => {
    const agrupados = resultados.reduce((acc, resultado) => {
      const key = resultado.titulo;
      if (!acc[key]) {
        acc[key] = {
          titulo: key,
          intentos: [],
        };
      }
      acc[key].intentos.push(resultado);
      return acc;
    }, {});

    Object.values(agrupados).forEach(ensayo => {
      const puntajes = ensayo.intentos.map(i => i.puntaje);
      const tiempos = ensayo.intentos.map(i => i.tiempoUsado).filter(t => t != null);

      ensayo.promedio = (puntajes.reduce((a, b) => a + b, 0) / puntajes.length).toFixed(1);
      ensayo.mejorPuntaje = Math.max(...puntajes);
      ensayo.peorPuntaje = Math.min(...puntajes);
      ensayo.tiempoPromedio = tiempos.length > 0
        ? (tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(0)
        : 'N/A';
      ensayo.cantidadIntentos = puntajes.length;
      ensayo.total = ensayo.intentos[0]?.total ?? 100;
    });

    return agrupados;
  }, [resultados]);

  const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null);

  const ensayosOrdenados = useMemo(() => {
    return Object.values(resultadosPorEnsayo).sort((a, b) => b.promedio - a.promedio);
  }, [resultadosPorEnsayo]);

  return (
    <div className="Resultados">
      <h1 className="Resultados-header">📊 Resultados de Ensayos</h1>

      {ensayosOrdenados.length === 0 ? (
        <div className="Resultados-empty">No hay resultados disponibles aún.</div>
      ) : (
        <div className="Resultados-grid">
          <div>
            <h2 className="Resultados-header" style={{fontSize: '1.75rem', marginBottom: '1rem', color: '#61dafb'}}>📚 Ensayos Realizados</h2>
            {ensayosOrdenados.map((ensayo) => (
              <div
                key={ensayo.titulo}
                className={`Resultados-card ${
                  ensayoSeleccionado?.titulo === ensayo.titulo ? 'selected' : ''
                }`}
              >
                <button
                  className="Resultados-button"
                  onClick={() => setEnsayoSeleccionado(ensayo)}
                >
                  {ensayo.titulo}
                </button>

                <div className="Resultados-stats">
                  <div>
                    <span>Intentos</span>
                    <span>{ensayo.cantidadIntentos}</span>
                  </div>
                  <div>
                    <span>Promedio</span>
                    <span>{ensayo.promedio}/{ensayo.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="Resultados-details">
            {ensayoSeleccionado ? (
              <>
                <h2>{ensayoSeleccionado.titulo}</h2>

                <div className="Resultados-cards-grid">
                  <div className="Resultados-small-card">
                    <p>Promedio</p>
                    <p>{ensayoSeleccionado.promedio}</p>
                  </div>
                  <div className="Resultados-small-card">
                    <p>Mejor Puntaje</p>
                    <p>{ensayoSeleccionado.mejorPuntaje}</p>
                  </div>
                  <div className="Resultados-small-card">
                    <p>Peor Puntaje</p>
                    <p>{ensayoSeleccionado.peorPuntaje}</p>
                  </div>
                  <div className="Resultados-small-card">
                    <p>Tiempo Promedio</p>
                    <p>
                      {ensayoSeleccionado.tiempoPromedio === 'N/A'
                        ? 'N/A'
                        : `${Math.floor(ensayoSeleccionado.tiempoPromedio / 60)}:${String(ensayoSeleccionado.tiempoPromedio % 60).padStart(2, '0')} min`}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="Resultados-empty">
                Selecciona un ensayo para ver los detalles.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resultados;
