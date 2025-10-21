const express = require('express');
const router = express.Router();
const pool = require('../db');

// Crear un nuevo ensayo con sus preguntas
router.post('/', async (req, res) => {
  const { titulo, asignatura, tiempoMinutos, curso_id, preguntas } = req.body;

  // Validaciones básicas
  if (!titulo || !asignatura || !Number.isInteger(tiempoMinutos) || tiempoMinutos <= 0) {
    return res.status(400).json({ error: 'Faltan datos: titulo, asignatura y tiempoMinutos (>0) son obligatorios.' });
  }
  if (curso_id == null || !Number.isInteger(Number(curso_id))) {
    return res.status(400).json({ error: 'curso_id es obligatorio y debe ser entero.' });
  }
  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return res.status(400).json({ error: 'Debes enviar un arreglo de IDs de preguntas (no vacío).' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validar que el curso exista
    const cursoRes = await client.query('SELECT 1 FROM cursos WHERE id = $1', [Number(curso_id)]);
    if (cursoRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El curso especificado no existe.' });
    }

    // Validar preguntas existentes
    const uniqIds = [...new Set(preguntas.map(Number).filter(n => Number.isInteger(n)))];
    const existRes = await client.query(
      'SELECT id FROM preguntas WHERE id = ANY($1::int[])',
      [uniqIds]
    );
    const existIds = new Set(existRes.rows.map(r => r.id));
    const faltantes = uniqIds.filter(id => !existIds.has(id));
    if (faltantes.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Algunas preguntas no existen', faltantes });
    }

    // INSERT incluyendo curso_id
    const insertEnsayo = `
      INSERT INTO ensayos (titulo, fecha, asignatura, num_preguntas, tiempo_minutos, puntaje, curso_id)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, 0, $5)
      RETURNING id, curso_id
    `;
    const ensayoRes = await client.query(insertEnsayo, [
      titulo,
      asignatura,
      uniqIds.length,
      tiempoMinutos,
      Number(curso_id)
    ]);
    const { id: ensayoId } = ensayoRes.rows[0];

    // Vincular preguntas
    for (const pid of uniqIds) {
      await client.query(
        'INSERT INTO ensayo_pregunta (ensayo_id, pregunta_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [ensayoId, pid]
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({ id: ensayoId, mensaje: 'Ensayo creado', curso_id: Number(curso_id) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creando ensayo:', err);
    return res.status(500).json({ error: 'Error al crear el ensayo' });
  } finally {
    client.release();
  }
});

// Obtener todos los ensayos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ensayos ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ensayos:', err.message);
    res.status(500).json({ error: 'Error al obtener ensayos' });
  }
});

// Obtener ensayos disponibles (sin resolver)
router.get('/disponibles', async (req, res) => {
  const { curso_id } = req.query;
  try {
    let sql = `
      SELECT 
        id, 
        titulo, 
        asignatura, 
        num_preguntas, 
        tiempo_minutos AS "tiempoMinutos", 
        fecha, 
        curso_id
      FROM ensayos
      WHERE TRUE
    `;
    const params = [];

    if (curso_id !== undefined && curso_id !== null && curso_id !== '') {
      sql += ' AND curso_id = $1';
      params.push(Number(curso_id));
    }

    sql += ' ORDER BY fecha DESC, id DESC';

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('Error listando ensayos disponibles:', e);
    res.status(500).json({ error: 'No se pudieron listar los ensayos' });
  }
});

// Obtener preguntas de un ensayo
router.get('/:id/preguntas', async (req, res) => {
  const ensayoId = req.params.id;

  try {
    const preguntasRes = await pool.query(`
      SELECT p.id, p.texto, p.dificultad, p.materia, p.profesor_id
      FROM preguntas p
      JOIN ensayo_pregunta ep ON ep.pregunta_id = p.id
      WHERE ep.ensayo_id = $1
    `, [ensayoId]);

    const preguntas = preguntasRes.rows;

    const preguntasConOpciones = await Promise.all(
      preguntas.map(async (pregunta) => {
        const opcionesRes = await pool.query(
          'SELECT id, texto, es_correcta FROM opciones WHERE pregunta_id = $1',
          [pregunta.id]
        );
        return {
          ...pregunta,
          opciones: opcionesRes.rows
        };
      })
    );

    res.json(preguntasConOpciones);
  } catch (err) {
    console.error('Error al obtener preguntas del ensayo:', err.message);
    res.status(500).json({ error: 'Error al obtener preguntas del ensayo' });
  }
});

// Obtener ensayos realizados por alumno
router.get('/alumno/:alumnoId', async (req, res) => {
  const alumnoId = req.params.alumnoId;

  try {
    const result = await pool.query(`
      SELECT e.id,
             e.titulo,
             e.asignatura,
             e.num_preguntas,
             e.tiempo_minutos AS "tiempoMinutos",
             r.puntaje,
             r.fecha
      FROM ensayos e
      JOIN resultados r ON e.id = r.ensayo_id
      WHERE r.alumno_id = $1
      ORDER BY r.fecha DESC, r.id DESC
    `, [alumnoId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ensayos por alumno:', err.message);
    res.status(500).json({ error: 'Error al obtener ensayos por alumno' });
  }
});

// Revisión de un ensayo: respuesta alumno vs correcta
router.get('/:id/revision/:alumnoId', async (req, res) => {
  const ensayoId = parseInt(req.params.id, 10);
  const alumnoId = parseInt(req.params.alumnoId, 10);

  try {
    const intentoRes = await pool.query(
      `SELECT respuestas, puntaje, fecha
       FROM resultados
       WHERE ensayo_id = $1 AND alumno_id = $2
       ORDER BY fecha DESC
       LIMIT 1`,
      [ensayoId, alumnoId]
    );

    if (intentoRes.rows.length === 0) {
      return res.status(404).json({ error: 'No hay intento registrado para este alumno en este ensayo' });
    }

    const intento = intentoRes.rows[0];
    const respuestas = intento.respuestas || {}; 

    const preguntasRes = await pool.query(
      `SELECT p.id, p.texto, p.dificultad, p.materia, p.profesor_id
       FROM preguntas p
       JOIN ensayo_pregunta ep ON ep.pregunta_id = p.id
       WHERE ep.ensayo_id = $1
       ORDER BY p.id`,
      [ensayoId]
    );

    const preguntas = preguntasRes.rows;

    const detalladas = await Promise.all(
      preguntas.map(async (preg) => {
        const optsRes = await pool.query(
          `SELECT id, texto, es_correcta
           FROM opciones
           WHERE pregunta_id = $1
           ORDER BY id`,
          [preg.id]
        );
        const respuestaAlumno = respuestas[preg.id];
        let seleccionadaIndex = null;
        
        if (respuestaAlumno !== undefined && respuestaAlumno !== null) {
          seleccionadaIndex = typeof respuestaAlumno === 'string' 
            ? parseInt(respuestaAlumno, 10) 
            : respuestaAlumno;
        }

        const opciones = optsRes.rows.map((o, idx) => ({
          id: o.id,
          texto: o.texto,
          es_correcta: o.es_correcta,
          seleccionada: (seleccionadaIndex === idx)
        }));

        const correctaIndex = optsRes.rows.findIndex(o => o.es_correcta === true);

        return {
          id: preg.id,
          texto: preg.texto,
          materia: preg.materia,
          dificultad: preg.dificultad,
          opciones,
          seleccionadaIndex: seleccionadaIndex,
          correctaIndex
        };
      })
    );

    res.json({
      meta: {
        puntaje: intento.puntaje,
        fecha: intento.fecha
      },
      preguntas: detalladas
    });
  } catch (err) {
    console.error('Error en revisión de ensayo:', err);
    res.status(500).json({ error: 'Error obteniendo la revisión del ensayo' });
  }
});


module.exports = router;
