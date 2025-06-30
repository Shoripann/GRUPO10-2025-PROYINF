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

module.exports = router;
