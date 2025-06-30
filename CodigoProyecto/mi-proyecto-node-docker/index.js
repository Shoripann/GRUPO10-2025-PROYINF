const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});


// Rutas
const profesoresRoutes = require('./routes/profesores');
app.use('/api/profesores', profesoresRoutes);

// Ruta de prueba
app.get('/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ hora: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});
//ruta preguntas
const preguntasRoutes = require('./routes/preguntas');
app.use('/api/preguntas', preguntasRoutes);
//opciones
const opcionesRoutes = require('./routes/opciones');
app.use('/api/opciones', opcionesRoutes);


// Ensayos
const ensayosRoutes = require('./routes/ensayos');
app.use('/api/ensayos', ensayosRoutes);
//resultados
const resultadosRoutes = require('./routes/resultados');
app.use('/api/resultados', resultadosRoutes);
//autentificacion
const loginRoute = require('./routes/auth');
app.use('/api/login', loginRoute);






app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
