const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los alumnos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, c.nombre AS curso, c.letra, col.nombre AS colegio
      FROM alumnos a
      LEFT JOIN cursos c ON a.curso_id = c.id
      LEFT JOIN colegios col ON a.colegio_id = col.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

// Obtener un alumno por id (incluye curso_id)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.id, a.nombre, a.email, a.curso_id,
              c.nombre AS curso, c.letra
       FROM alumnos a
       LEFT JOIN cursos c ON a.curso_id = c.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener alumno por id:', err);
    res.status(500).json({ error: 'Error al obtener alumno' });
  }
});


module.exports = router;
