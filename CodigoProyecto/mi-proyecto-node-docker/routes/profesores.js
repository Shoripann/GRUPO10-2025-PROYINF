const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear un nuevo profesor
router.post('/', async (req, res) => {
  const { nombre, email, password, asignatura } = req.body;

  // Validación básica
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await db.query(
      `INSERT INTO profesores (nombre, email, password, asignatura)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre, email, password, asignatura]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al insertar profesor:', err);

    // Código de error 23505 = violación de restricción única (email duplicado)
    if (err.code === '23505') {
      res.status(409).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Obtiene a todos los profesores
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, email, asignatura FROM profesores');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener profesores:', err);
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
});

// Eliminar a todos los profesores
router.delete('/', async (req, res) => {
  try {
    await db.query('DELETE FROM profesores');
    res.json({ mensaje: 'Profesores eliminados correctamente' });
  } catch (err) {
    console.error('Error eliminando los profesores:', err);
    res.status(500).json({ error: 'Error eliminando los profesores' });
  }
});

module.exports = router;
