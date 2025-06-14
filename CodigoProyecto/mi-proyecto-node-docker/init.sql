CREATE TABLE profesores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE cursos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  profesor_id INT,
  FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL
);

CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  curso_id INT,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
);

CREATE TABLE ensayos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  alumno_id INT NOT NULL,
  puntaje DECIMAL(5,2) CHECK (puntaje >= 0 AND puntaje <= 100),
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

CREATE TABLE preguntas (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL,
  profesor_id INT,
  FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL
);

CREATE TABLE opciones (
  id SERIAL PRIMARY KEY,
  pregunta_id INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

CREATE TABLE ensayo_pregunta (
  ensayo_id INT NOT NULL,
  pregunta_id INT NOT NULL,
  PRIMARY KEY (ensayo_id, pregunta_id),
  FOREIGN KEY (ensayo_id) REFERENCES ensayos(id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

CREATE TABLE respuestas (
  id SERIAL PRIMARY KEY,
  ensayo_id INT NOT NULL,
  pregunta_id INT NOT NULL,
  alumno_id INT NOT NULL,
  opcion_id INT NOT NULL,
  FOREIGN KEY (ensayo_id) REFERENCES ensayos(id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  FOREIGN KEY (opcion_id) REFERENCES opciones(id) ON DELETE CASCADE
);

ALTER TABLE profesores ADD COLUMN IF NOT EXISTS password VARCHAR(100);
ALTER TABLE alumnos ADD COLUMN IF NOT EXISTS password VARCHAR(100);
ALTER TABLE preguntas
ADD COLUMN IF NOT EXISTS dificultad VARCHAR(20);

ALTER TABLE preguntas
ADD COLUMN IF NOT EXISTS materia VARCHAR(100);


INSERT INTO alumnos (nombre, email, password)
VALUES ('alumno', 'alumno@alumno.cl', 'contraseña');

INSERT INTO profesores (nombre, email, password)
VALUES ('profesor', 'profesor@profesor.cl', 'contraseña');