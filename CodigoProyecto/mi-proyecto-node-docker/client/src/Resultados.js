import React, { useState, useEffect } from 'react';
import './Resultados.css';

const Resultados = () => {
  const [ensayos, setEnsayos] = useState([]);
  const [statsPorEnsayo, setStatsPorEnsayo] = useState({});
  const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnsayos = async () => {
      try {
        const res = await fetch('/api/ensayos');
        const data = await res.json();
        setEnsayos(data);
      } catch (err) {
        console.error('Error cargando ensayos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnsayos();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!ensayoSeleccionado) return;
      try {
        const res = await fetch(`/api/resultados/estadisticas/ensayo/${ensayoSeleccionado.id}`);
        if (!res.ok) {
          console.warn('No hay estadísticas para este ensayo');
          return;
        }
        const data = await res.json();
        setStatsPorEnsayo(prev => ({
          ...prev,
          [ensayoSeleccionado.id]: data,
        }));
      } catch (err) {
        console.error('Error cargando estadísticas', err);
      }
    };
    fetchStats();
  }, [ensayoSeleccionado]);

  if (loading) {
    return (
      <div className="Resultados">
        <h1 className="Resultados-header">📊 Resultados de Ensayos</h1>
        <div className="Resultados-empty">Cargando ensayos…</div>
      </div>
    );
  }

  const ensayosOrdenados = [...ensayos].sort((a, b) => {
    const sa = statsPorEnsayo[a.id]?.promedio ?? 0;
    const sb = statsPorEnsayo[b.id]?.promedio ?? 0;
    return sb - sa;
  });

  return (
    <div className="Resultados">
      <h1 className="Resultados-header">📊 Resultados de Ensayos</h1>

      {ensayosOrdenados.length === 0 ? (
        <div className="Resultados-empty">No hay ensayos disponibles aún.</div>
      ) : (
        <div className="Resultados-grid">
          {/* Lista de ensayos */}
          <div>
            <h2 className="Resultados-header" style={{fontSize: '1.75rem', marginBottom: '1rem', color: '#61dafb'}}>
              📚 Ensayos
            </h2>
            {ensayosOrdenados.map((ensayo) => {
              const stats = statsPorEnsayo[ensayo.id];
              return (
                <div
                  key={ensayo.id}
                  className={`Resultados-card ${
                    ensayoSeleccionado?.id === ensayo.id ? 'selected' : ''
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
                      <span>{stats ? stats.intentos : '—'}</span>
                    </div>
                    <div>
                      <span>Promedio</span>
                      <span>
                        {stats && stats.promedio
                          ? Number(stats.promedio).toFixed(1)
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalle de ensayo seleccionado */}
          <div className="Resultados-details">
            {ensayoSeleccionado ? (
              (() => {
                const stats = statsPorEnsayo[ensayoSeleccionado.id];
                return (
                  <>
                    <h2>{ensayoSeleccionado.titulo}</h2>

                    {stats ? (
                      <div className="Resultados-cards-grid">
                        <div className="Resultados-small-card">
                          <p>Intentos</p>
                          <p>{stats.intentos}</p>
                        </div>
                        <div className="Resultados-small-card">
                          <p>Promedio</p>
                          <p>{Number(stats.promedio || 0).toFixed(2)}</p>
                        </div>
                        <div className="Resultados-small-card">
                          <p>Mejor puntaje</p>
                          <p>{stats.mejor ?? '—'}</p>
                        </div>
                        <div className="Resultados-small-card">
                          <p>Peor puntaje</p>
                          <p>{stats.peor ?? '—'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="Resultados-empty">
                        No hay estadísticas precalculadas para este ensayo.
                      </div>
                    )}
                  </>
                );
              })()
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
