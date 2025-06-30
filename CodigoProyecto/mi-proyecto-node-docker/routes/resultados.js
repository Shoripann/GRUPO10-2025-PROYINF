const express = require('express');
const router = express.Router();
const db = require('../db');

// Guardar resultado de un ensayo con respuestas
router.post('/', async (req, res) => {
  const { ensayo_id, alumno_id, respuestas } = req.body;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Calcular puntaje
    let correctas = 0;
    for (const [preguntaId, opcionIndex] of Object.entries(respuestas)) {
      const opcionesRes = await client.query(
        'SELECT id, es_correcta FROM opciones WHERE pregunta_id = $1 ORDER BY id',
        [preguntaId]
      );
      const opcionSeleccionada = opcionesRes.rows[opcionIndex];
      if (opcionSeleccionada?.es_correcta) correctas++;
    }

    const puntaje = Math.round((correctas / Object.keys(respuestas).length) * 100);

    // Insertar resultado
    await client.query(
      `INSERT INTO resultados (ensayo_id, alumno_id, puntaje, fecha)
       VALUES ($1, $2, $3, CURRENT_DATE)`,
      [ensayo_id, alumno_id, puntaje]
    );

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Resultado guardado', puntaje });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al guardar resultado:', err);
    res.status(500).json({ error: 'Error al guardar resultado' });
  } finally {
    client.release();
  }
});

// Obtener resultados de un alumno con datos del ensayo
router.get('/alumno/:alumnoId', async (req, res) => {
  const { alumnoId } = req.params;

  try {
    const result = await db.query(
      `SELECT r.id, r.puntaje, r.fecha, e.titulo, e.id AS ensayo_id
       FROM resultados r
       JOIN ensayos e ON r.ensayo_id = e.id
       WHERE r.alumno_id = $1
       ORDER BY r.fecha DESC`,
      [alumnoId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    res.status(500).json({ error: 'Error obteniendo resultados' });
  }
});

module.exports = router;
