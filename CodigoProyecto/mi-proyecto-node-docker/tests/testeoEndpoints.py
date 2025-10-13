import unittest
import requests

class TestEndpointProfesor(unittest.TestCase):
	URL = "http://localhost:4000/api/profesores"

	@classmethod
	def setUpClass(cls):
		print("\nIniciando el proceso de pruebas.")
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
