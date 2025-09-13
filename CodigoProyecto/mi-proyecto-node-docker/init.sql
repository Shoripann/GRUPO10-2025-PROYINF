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
    password VARCHAR(100) NOT NULL,
    asignatura VARCHAR(100)
);

-- 3.tabla cursos 
CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    letra CHAR(1),
    profesor_id INT REFERENCES profesores(id) ON DELETE SET NULL
);

-- 4.tabla alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    curso_id INT REFERENCES cursos(id) ON DELETE SET NULL,
    colegio_id INT REFERENCES colegios(id) ON DELETE SET NULL
);

-- 5.  tabla ensayos
CREATE TABLE IF NOT EXISTS ensayos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    asignatura VARCHAR(100),
    num_preguntas INT,
    puntaje DECIMAL(5,2) DEFAULT 0 CHECK (puntaje >= 0 AND puntaje <= 100),
    tiempo_minutos INT
);

-- 6. tabla preguntas 
CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    dificultad VARCHAR(20),
    materia VARCHAR(100),
    profesor_id INT REFERENCES profesores(id) ON DELETE SET NULL,
    es_banco BOOLEAN NOT NULL DEFAULT false
);

-- 7.tabla opciones 
CREATE TABLE IF NOT EXISTS opciones (
    id SERIAL PRIMARY KEY,
    pregunta_id INT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    texto VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE
);

-- 8.  tabla ensayo_pregunta 
CREATE TABLE IF NOT EXISTS ensayo_pregunta (
    id SERIAL PRIMARY KEY,
    ensayo_id INT NOT NULL REFERENCES ensayos(id) ON DELETE CASCADE,
    pregunta_id INT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    UNIQUE (ensayo_id, pregunta_id)
);


-- 9. tabla resultados 
CREATE TABLE IF NOT EXISTS resultados (
    id SERIAL PRIMARY KEY,
    ensayo_id INT NOT NULL REFERENCES ensayos(id) ON DELETE CASCADE,
    alumno_id INT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    puntaje DECIMAL(5,2),
    fecha DATE DEFAULT CURRENT_DATE
);

INSERT INTO profesores (id, nombre, email, password, asignatura)
VALUES (1, 'Profesor', 'profesor@profesor.com', 'profesor', 'Matematicas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alumnos (id, nombre, email, password)
VALUES (1,'Camilo Estudiante', 'camilo@ejemplo.com', '1234')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE resultados
ADD COLUMN IF NOT EXISTS respuestas JSONB;