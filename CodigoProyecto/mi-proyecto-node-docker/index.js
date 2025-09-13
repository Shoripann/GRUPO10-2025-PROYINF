const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// frontend y variante 3001
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});

// Ruta de prueba
app.get('/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ hora: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

// Rutas
app.use('/api/profesores', require('./routes/profesores'));
app.use('/api/preguntas', require('./routes/preguntas'));
app.use('/api/opciones', require('./routes/opciones'));
app.use('/api/ensayos', require('./routes/ensayos'));
app.use('/api/resultados', require('./routes/resultados'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/alumnos', require('./routes/alumnos'));

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
