const express = require('express');
const router = express.Router();
const {
  guardarResultadoFinal,
  guardarResultadoParcial,
  obtenerResultadoParcial,
  obtenerResultadosAlumno,
  obtenerEstadisticasEnsayo
} = require('../services/resultadosService');

// POST resultado final
router.post('/', async (req, res) => {
  try {
    const data = await guardarResultadoFinal(req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error('❌ Error guardando resultado:', err);
    res.status(500).json({ error: 'Error guardando resultado' });
  }
});

// POST resultados pendientes
router.post('/procesar-pendientes', async (req, res) => {
  try {
    const { rows: pendientes } = await db.query(
      'SELECT ensayo_id FROM resultados_pendientes'
    );

    for (const p of pendientes) {
      const { rows } = await db.query(
        `SELECT 
           COUNT(*) AS intentos,
           AVG(puntaje) AS promedio,
           MAX(puntaje) AS mejor,
           MIN(puntaje) AS peor
         FROM resultados
         WHERE ensayo_id = $1`,
        [p.ensayo_id]
      );

      const stats = rows[0];

      await db.query(
        `INSERT INTO resultados_cache (ensayo_id, datos, actualizado_en)
         VALUES ($1, $2, NOW())
         ON CONFLICT (ensayo_id)
         DO UPDATE SET datos = EXCLUDED.datos,
                       actualizado_en = NOW()`,
        [p.ensayo_id, stats]
      );
    }

    await db.query('DELETE FROM resultados_pendientes');

    res.json({ mensaje: 'Procesadas', cantidad: pendientes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error procesando pendientes' });
  }
});

// PUT progreso parcial
router.put('/parcial', async (req, res) => {
  try {
    const data = await guardarResultadoParcial(req.body);
    res.json(data);
  } catch (err) {
    console.error('❌ Error guardando parcial:', err);
    res.status(500).json({ error: 'Error guardando parcial' });
  }
});

// GET progreso
router.get('/parcial/:ensayoId/:alumnoId', async (req, res) => {
  try {
    const data = await obtenerResultadoParcial(req.params.ensayoId, req.params.alumnoId);
    if (!data) return res.status(404).json({ error: 'No hay progreso guardado' });
    res.json(data);
  } catch (err) {
    console.error('❌ Error obteniendo parcial:', err);
    res.status(500).json({ error: 'Error obteniendo parcial' });
  }
});

// GET resultados por alumno
router.get('/:alumnoId', async (req, res) => {
  try {
    const data = await obtenerResultadosAlumno(req.params.alumnoId);
    res.json(data);
  } catch (err) {
    console.error('❌ Error listando resultados:', err);
    res.status(500).json({ error: 'Error listando resultados' });
  }
});

// GET estadísticas de un ensayo
router.get('/estadisticas/ensayo/:ensayoId', async (req, res) => {
  try {
    const data = await obtenerEstadisticasEnsayo(req.params.ensayoId);
    res.json(data);
  } catch (err) {
    console.error('❌ Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;