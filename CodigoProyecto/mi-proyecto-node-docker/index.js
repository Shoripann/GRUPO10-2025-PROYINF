const express = require('express');
const pool = require('./db');
const app = express();
const port = 3000;

app.use(express.json()); // Para parsear JSON en las requests

// ---------------------- PROFESORES ----------------------
// Crear profesor
app.post('/profesores', async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO profesores (nombre, email) VALUES ($1, $2) RETURNING *',
      [nombre, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear profesor");
  }
});

// Listar todos los profesores
app.get('/profesores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profesores');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener profesores");
  }
});

// ---------------------- CURSOS ----------------------
// Crear curso (asociado a un profesor)
app.post('/cursos', async (req, res) => {
  const { nombre, profesor_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cursos (nombre, profesor_id) VALUES ($1, $2) RETURNING *',
      [nombre, profesor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear curso");
  }
});

// Listar cursos con información del profesor
app.get('/cursos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nombre, p.nombre AS profesor 
      FROM cursos c
      LEFT JOIN profesores p ON c.profesor_id = p.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener cursos");
  }
});

// ---------------------- ALUMNOS ----------------------
// Matricular alumno en un curso
app.post('/alumnos', async (req, res) => {
  const { nombre, email, curso_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO alumnos (nombre, email, curso_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, curso_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al matricular alumno");
  }
});

// Listar alumnos con su curso
app.get('/alumnos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.nombre, a.email, c.nombre AS curso
      FROM alumnos a
      LEFT JOIN cursos c ON a.curso_id = c.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener alumnos");
  }
});

// ---------------------- RUTA INICIAL ----------------------

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    // Buscar en profesores
    const profRes = await pool.query(
      'SELECT id, nombre, email, password FROM profesores WHERE email = $1',
      [email]
    );

    if (profRes.rows.length > 0) {
      const profesor = profRes.rows[0];

      if (profesor.password === password) {
        delete profesor.password;
        return res.json({ role: 'profesor', user: profesor });
      } else {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    }

    // Buscar en alumnos
    const alumRes = await pool.query(
      `SELECT a.id, a.nombre, a.email, a.password, c.nombre AS curso
       FROM alumnos a
       LEFT JOIN cursos c ON a.curso_id = c.id
       WHERE a.email = $1`,
      [email]
    );

    if (alumRes.rows.length > 0) {
      const alumno = alumRes.rows[0];

      if (alumno.password === password) {
        delete alumno.password;
        return res.json({ role: 'alumno', user: alumno });
      } else {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    }

    // No se encontró ningún usuario
    return res.status(404).json({ error: 'Usuario no encontrado' });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});



app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
