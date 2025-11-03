import os
import json
import unittest
import requests

class TestCursosEndpoints(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("\nIniciando el proceso de pruebas de /api/cursos.")
        cls.BASE_URL = os.getenv("BASE_URL", "http://localhost:4000")
        cls.CURSOS_URL = f"{cls.BASE_URL}/api/cursos"

    @classmethod
    def tearDownClass(cls):
        print("\nFinalizado pruebas de endpoint GET de cursos.\n")

    def test_listar_cursos_ordenados(self):
        r = requests.get(self.CURSOS_URL, timeout=10)
        self.assertEqual(r.status_code, 200, msg=f"Status inesperado: {r.status_code}, body={r.text}")

        data = r.json()
        self.assertIsInstance(data, list, "La respuesta debe ser una lista")

        if len(data) >= 2:
            nombres = [c["nombre"] for c in data]
            self.assertEqual(
                nombres, sorted(nombres),
                "La lista no está ordenada por nombre ascendente"
            )

        for c in data:
            self.assertIn("id", c)
            self.assertIn("nombre", c)
            self.assertIn("letra", c)

    def test_obtener_curso_por_id_inexistente_da_404(self):
        id_inexistente = 999999
        url = f"{self.CURSOS_URL}/{id_inexistente}"
        r = requests.get(url, timeout=10)

        self.assertEqual(r.status_code, 404, msg=f"Se esperaba 404, pero se obtuvo {r.status_code}")
        try:
            body = r.json()
        except json.JSONDecodeError:
            self.fail(f"Se esperaba JSON, body={r.text!r}")

        self.assertEqual(body.get("error"), "Curso no encontrado")

class TestEndpointProfesor(unittest.TestCase):
	URL = "http://localhost:4000/api/profesores"

	@classmethod
	def setUpClass(cls):
		print("\nIniciando el proceso de pruebas de /api/profesores.")
		requests.delete(cls.URL)

		data = {
			"nombre": "Profesor",
			"email": "profesor@profesor.com",
			"password": "1234",
			"asignatura": "Matemáticas"
		}

		response = requests.post(cls.URL, json = data)
		assert response.status_code == 201
		print( "Profesor creado" )

	def test_profesorValido(self):
		data = {
			"nombre": "Martina Alvarez",
			"email": "martina@profesor.com",
			"password": "5678",
			"asignatura": "Matemáticas"
		}

		response = requests.post(self.URL, json = data)
		self.assertEqual(response.status_code, 201)
		self.assertIn("email", response.json())

	def test_profesorSinCampos(self):
		data = {
			"nombre": "Joaquín Quezada",
			"asignatura": "Lenguaje"
		}

		response = requests.post(self.URL, json = data)
		self.assertEqual(response.status_code, 400)
		self.assertIn("error", response.json())

	@classmethod
	def tearDownClass(cls):
		requests.delete(cls.URL)
		print("\nProceso de Pruebas Finalizado: Pofesores eliminados correctamente.")


if __name__ == "__main__":
    unittest.main(verbosity = 2)