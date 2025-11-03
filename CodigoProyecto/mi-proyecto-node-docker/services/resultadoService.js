const db = require('../db');

async function guardarResultadoFinal({ ensayo_id, alumno_id, puntaje, respuestas }) {
  const respObj = typeof respuestas === 'string' ? JSON.parse(respuestas) : respuestas;

  await db.query(
    `INSERT INTO resultados (ensayo_id, alumno_id, puntaje, fecha, respuestas)
     VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
    [Number(ensayo_id), Number(alumno_id), Number(puntaje), respObj]
  );

  await db.query(
    `INSERT INTO resultados_pendientes (ensayo_id)
     VALUES ($1)
     ON CONFLICT DO NOTHING`,
    [ensayo_id]
  );
  return { mensaje: 'Resultado guardado correctamente' };
}

async function guardarResultadoParcial({ ensayo_id, alumno_id, respuestas }) {
  const respObj = typeof respuestas === 'string' ? JSON.parse(respuestas) : respuestas;

  await db.query(
    `INSERT INTO resultados_parciales (ensayo_id, alumno_id, respuestas, actualizado_en)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (ensayo_id, alumno_id)
     DO UPDATE SET respuestas = EXCLUDED.respuestas,
                   actualizado_en = NOW()`,
    [Number(ensayo_id), Number(alumno_id), respObj]
  );
  return { mensaje: 'Progreso guardado automáticamente' };
}

async function obtenerResultadoParcial(ensayo_id, alumno_id) {
  const { rows } = await db.query(
    `SELECT respuestas, actualizado_en
       FROM resultados_parciales
      WHERE ensayo_id = $1 AND alumno_id = $2`,
    [Number(ensayo_id), Number(alumno_id)]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

async function obtenerResultadosAlumno(alumno_id) {
  const { rows } = await db.query(
    `SELECT id, ensayo_id, alumno_id, puntaje, fecha
       FROM resultados
      WHERE alumno_id = $1
      ORDER BY fecha DESC, id DESC`,
    [Number(alumno_id)]
  );
  return rows;
}

async function obtenerEstadisticasEnsayo(ensayo_id) {
  const { rows } = await db.query(
    `SELECT 
        COUNT(*) AS intentos,
        AVG(puntaje) AS promedio,
        MAX(puntaje) AS mejor,
        MIN(puntaje) AS peor
     FROM resultados
     WHERE ensayo_id = $1`,
    [Number(ensayo_id)]
  );
  return rows[0];
}

module.exports = {
  guardarResultadoFinal,
  guardarResultadoParcial,
  obtenerResultadoParcial,
  obtenerResultadosAlumno,
  obtenerEstadisticasEnsayo
};
