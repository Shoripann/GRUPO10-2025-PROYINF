-- 1.tabla colegios 
CREATE TABLE IF NOT EXISTS colegios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL
);

-- 2. tabla profesores 
CREATE TABLE IF NOT EXISTS profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- 3.tabla cursos 
CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    letra CHAR(1),
    profesor_id INT,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL
);

-- 4.tabla alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    curso_id INT,
    colegio_id INT,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (colegio_id) REFERENCES colegios(id) ON DELETE SET NULL
);

-- 5.  tabla ensayos
CREATE TABLE IF NOT EXISTS ensayos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    asignatura VARCHAR(100),
    num_preguntas INT,
    puntaje DECIMAL(5,2) CHECK (puntaje >= 0 AND puntaje <= 100),
    alumno_id INT NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE
);

-- 6. tabla preguntas 
CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    dificultad VARCHAR(20),
    materia VARCHAR(100),
    profesor_id INT,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL
);

-- 7.tabla opciones 
CREATE TABLE IF NOT EXISTS opciones (
    id SERIAL PRIMARY KEY,
    pregunta_id INT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- 8.  tabla ensayo_pregunta 
CREATE TABLE IF NOT EXISTS ensayo_pregunta (
    ensayo_id INT NOT NULL,
    pregunta_id INT NOT NULL,
    PRIMARY KEY (ensayo_id, pregunta_id),
    FOREIGN KEY (ensayo_id) REFERENCES ensayos(id) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- 9. tabla resultados 
CREATE TABLE IF NOT EXISTS resultados (
    id SERIAL PRIMARY KEY,
    ensayo_id INT NOT NULL,
    puntaje_obtenido DECIMAL(5,2),
    fecha_resolucion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (ensayo_id) REFERENCES ensayos(id) ON DELETE CASCADE
);

INSERT INTO profesores (id, nombre, email, password)
VALUES (1, 'Profesor', 'profesor@profesor.com', 'profesor');

ALTER TABLE resultados
ADD COLUMN alumno_id INT REFERENCES alumnos(id) ON DELETE CASCADE;

ALTER TABLE resultados
RENAME COLUMN puntaje_obtenido TO puntaje;

ALTER TABLE resultados
RENAME COLUMN fecha_resolucion TO fecha;

INSERT INTO alumnos (nombre, email, password, curso_id, colegio_id)
VALUES ('Camilo Estudiante', 'camilo@ejemplo.com', '1234', NULL, NULL);

ALTER TABLE ensayos DROP COLUMN alumno_id;

ALTER TABLE ensayos ADD COLUMN tiempo_minutos INT;
