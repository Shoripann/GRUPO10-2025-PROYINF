// routes/resultados.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Guarda resultado
router.post('/', async (req, res) => {
  try {
    const { ensayo_id, alumno_id, puntaje, respuestas } = req.body;

    if (!ensayo_id || !alumno_id || !respuestas) {
      return res.status(400).json({
        error: 'Faltan campos: ensayo_id, alumno_id y respuestas son obligatorios.'
      });
    }

    const respObj = typeof respuestas === 'string' ? JSON.parse(respuestas) : respuestas;

    let puntajeFinal = typeof puntaje === 'number' ? puntaje : null;

    await db.query(
      `INSERT INTO resultados (ensayo_id, alumno_id, puntaje, fecha, respuestas)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      [Number(ensayo_id), Number(alumno_id), puntajeFinal, respObj]
    );

    return res.status(201).json({ mensaje: 'Resultado guardado' });
  } catch (err) {
    console.error('❌ Error guardando resultado:', err);
    return res.status(500).json({ error: 'Error guardando resultado' });
  }
});

// autosave
router.put('/parcial', async (req, res) => {
  try {
    const { ensayo_id, alumno_id, respuestas } = req.body;

    if (!ensayo_id || !alumno_id || !respuestas) {
      return res.status(400).json({
        error: 'Faltan campos: ensayo_id, alumno_id y respuestas son obligatorios.'
      });
    }

    const respObj = typeof respuestas === 'string' ? JSON.parse(respuestas) : respuestas;

    await db.query(
      `INSERT INTO resultados_parciales (ensayo_id, alumno_id, respuestas, actualizado_en)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (ensayo_id, alumno_id)
       DO UPDATE SET respuestas = EXCLUDED.respuestas,
                     actualizado_en = NOW()`,
      [Number(ensayo_id), Number(alumno_id), respObj]
    );

    return res.status(200).json({ mensaje: 'Progreso guardado' });
  } catch (err) {
    console.error('❌ Error guardando parcial:', err);
    return res.status(500).json({ error: 'Error guardando parcial' });
  }
});

// obtencion resultado parcial
router.get('/parcial/:ensayoId/:alumnoId', async (req, res) => {
  try {
    const { ensayoId, alumnoId } = req.params;
    const { rows } = await db.query(
      `SELECT respuestas, actualizado_en
         FROM resultados_parciales
        WHERE ensayo_id = $1 AND alumno_id = $2`,
      [Number(ensayoId), Number(alumnoId)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No hay progreso guardado' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error obteniendo parcial:', err);
    return res.status(500).json({ error: 'Error obteniendo parcial' });
  }
});

// resultados por alumno
router.get('/:alumnoId', async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const r = await db.query(
      `SELECT r.id, r.ensayo_id, r.alumno_id, r.puntaje, r.fecha
         FROM resultados r
        WHERE r.alumno_id = $1
        ORDER BY r.fecha DESC, r.id DESC`,
      [Number(alumnoId)]
    );
    res.json(r.rows);
  } catch (err) {
    console.error('Error listando resultados:', err);
    res.status(500).json({ error: 'Error listando resultados' });
  }
});

module.exports = router;