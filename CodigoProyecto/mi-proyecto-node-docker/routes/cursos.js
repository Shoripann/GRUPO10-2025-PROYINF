const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT id, nombre, letra FROM cursos ORDER BY nombre');
  res.json(rows);
});
//obtener un curso por id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ error: 'Error al obtener curso' });
  }
});
module.exports = router;
