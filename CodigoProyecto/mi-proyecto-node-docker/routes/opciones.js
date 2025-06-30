const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { pregunta_id, texto, es_correcta } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO opciones (pregunta_id, texto, es_correcta)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [pregunta_id, texto, es_correcta]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al insertar opción:', err);
    res.status(500).json({ error: 'Error al guardar la opción' });
  }
});

module.exports = router;
