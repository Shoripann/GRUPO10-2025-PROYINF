const express = require('express');
const router = express.Router();
const pool = require('../db');

// Crear un nuevo ensayo con sus preguntas
router.post('/', async (req, res) => {
  const { titulo, asignatura, tiempoMinutos, preguntas, profesor_id } = req.body;

  if (!titulo || !asignatura || !tiempoMinutos || !Array.isArray(preguntas) || preguntas.length === 0) {
    return res.status(400).json({ error: 'Faltan campos requeridos o preguntas inválidas' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO ensayos (titulo, fecha, asignatura, num_preguntas, tiempo_minutos, puntaje,alumno_id)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5,$6)
      RETURNING id
    `;
    const ensayoRes = await client.query(insertQuery, [
      titulo,
      asignatura,
      preguntas.length,
      tiempoMinutos,
      0, // puntaje por defecto
      1
    ]);
    const ensayoId = ensayoRes.rows[0].id;

    const relacionQuery = `INSERT INTO ensayo_pregunta (ensayo_id, pregunta_id) VALUES ($1, $2)`;
    for (const preguntaId of preguntas) {
      await client.query(relacionQuery, [ensayoId, preguntaId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: '✅ Ensayo guardado correctamente', id: ensayoId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al guardar el ensayo:', err.message);
    res.status(500).json({ error: 'Error al guardar el ensayo', detalle: err.message });
  } finally {
    client.release();
  }
});

// Obtener todos los ensayos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ensayos ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ensayos:', err.message);
    res.status(500).json({ error: 'Error al obtener ensayos' });
  }
});

// Obtener ensayos disponibles (sin resolver)
router.get('/disponibles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, titulo, asignatura, num_preguntas, tiempo_minutos AS "tiempoMinutos"
      FROM ensayos
      ORDER BY fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ensayos disponibles:', err.message);
    res.status(500).json({ error: 'Error al obtener ensayos disponibles' });
  }
});

// Obtener preguntas de un ensayo
router.get('/:id/preguntas', async (req, res) => {
  const ensayoId = req.params.id;

  try {
    const preguntasRes = await pool.query(`
      SELECT p.id, p.texto, p.dificultad, p.materia, p.profesor_id
      FROM preguntas p
      JOIN ensayo_pregunta ep ON ep.pregunta_id = p.id
      WHERE ep.ensayo_id = $1
    `, [ensayoId]);

    const preguntas = preguntasRes.rows;

    const preguntasConOpciones = await Promise.all(
      preguntas.map(async (pregunta) => {
        const opcionesRes = await pool.query(
          'SELECT id, texto, es_correcta FROM opciones WHERE pregunta_id = $1',
          [pregunta.id]
        );
        return {
          ...pregunta,
          opciones: opcionesRes.rows
        };
      })
    );

    res.json(preguntasConOpciones);
  } catch (err) {
    console.error('Error al obtener preguntas del ensayo:', err.message);
    res.status(500).json({ error: 'Error al obtener preguntas del ensayo' });
  }
});

// Obtener ensayos realizados por alumno
router.get('/alumno/:alumnoId', async (req, res) => {
  const alumnoId = req.params.alumnoId;

  try {
    const result = await pool.query(`
      SELECT e.*
      FROM ensayos e
      JOIN resultados r ON e.id = r.ensayo_id
      WHERE r.alumno_id = $1
      ORDER BY r.fecha DESC
    `, [alumnoId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ensayos por alumno:', err.message);
    res.status(500).json({ error: 'Error al obtener ensayos por alumno' });
  }
});

module.exports = router;
