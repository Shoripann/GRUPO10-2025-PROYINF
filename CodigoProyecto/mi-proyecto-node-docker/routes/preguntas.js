const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear una nueva pregunta
router.post('/', async (req, res) => {
  try {
    const { texto, dificultad, materia, asignatura, profesor_id, es_banco } = req.body;
    const materiaFinal = (materia ?? asignatura ?? '').trim();

    if (!texto || !dificultad || !materiaFinal) {
      return res.status(400).json({ error: 'Faltan campos: texto, dificultad y asignatura/materia' });
    }
    let profesorIdFinal = null;
    if (profesor_id !== undefined && profesor_id !== null) {
      const profesorCheck = await db.query('SELECT id FROM profesores WHERE id = $1', [profesor_id]);
      if (profesorCheck.rows.length === 0) {
        return res.status(400).json({ error: 'El profesor especificado no existe' });
      }
      profesorIdFinal = profesor_id;
    } 

    const r = await db.query(
      `INSERT INTO preguntas (texto, dificultad, materia, profesorIdFinal, es_banco)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [texto, dificultad, materiaFinal, profesor_id ?? null, Boolean(es_banco)]
    );

    res.status(201).json({ id: r.rows[0].id });
  } catch (err) {
    console.error('Error creando pregunta:', err);
    res.status(500).json({ error: 'Error creando pregunta' });
  }
});

// Obtener todas las preguntas
router.get('/', async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT id, texto, dificultad, materia, materia AS asignatura, profesor_id, es_banco
         FROM preguntas
        ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener preguntas:', err);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

// Banco por asignatura (con opciones)
router.get('/banco/:asignatura', async (req, res) => {
  try {
    const asig = (req.params.asignatura || '').trim();
    if (!asig) return res.status(400).json({ error: 'Asignatura requerida' });

    const result = await db.query(
      `SELECT
          p.id,
          p.texto,
          p.dificultad,
          p.materia AS asignatura,
          COALESCE(json_agg(
            json_build_object(
              'id', o.id,
              'texto', o.texto,
              'esCorrecta', o.es_correcta
            )
          ) FILTER (WHERE o.id IS NOT NULL), '[]') AS opciones
        FROM preguntas p
        LEFT JOIN opciones o ON o.pregunta_id = p.id
       WHERE p.materia = $1
         AND p.es_banco = TRUE
       GROUP BY p.id, p.texto, p.dificultad, p.materia
       ORDER BY p.id`,
      [asig]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener banco:', err);
    res.status(500).json({ error: 'Error al obtener banco' });
  }
});

module.exports = router;
