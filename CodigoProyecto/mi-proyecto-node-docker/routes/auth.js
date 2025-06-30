const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta de login para profesores y alumnos
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    // Buscar en profesores
    const profRes = await pool.query(
      'SELECT id, nombre, email FROM profesores WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (profRes.rows.length > 0) {
      return res.json({
        role: 'profesor',
        user: profRes.rows[0]
      });
    }

    // Buscar en alumnos
    const alumRes = await pool.query(
      'SELECT id, nombre, email FROM alumnos WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (alumRes.rows.length > 0) {
      return res.json({
        role: 'alumno',
        user: alumRes.rows[0]
      });
    }

    // Si no se encontró en ninguno
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
