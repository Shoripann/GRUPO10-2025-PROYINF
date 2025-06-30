const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear una nueva pregunta
router.post('/', async (req, res) => {
  const { texto, dificultad, materia, profesor_id } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO preguntas (texto, dificultad, materia, profesor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [texto, dificultad, materia, profesor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al insertar pregunta:', err);
    res.status(500).json({ error: 'Error al guardar la pregunta' });
  }
});

// Obtener todas las preguntas
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM preguntas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener preguntas:', err);
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

module.exports = router;
