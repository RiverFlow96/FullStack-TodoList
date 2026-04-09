"""
Tests para los views de la aplicación tasks.
"""

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Task


class TaskViewSetTests(APITestCase):
    """Tests para el TaskViewSet."""

    def setUp(self):
        """Configura los datos de prueba."""
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="otherpass123",
        )
        self.task = Task.objects.create(
            user=self.user,
            title="Test Task",
            description="Test Description",
        )
        self.other_task = Task.objects.create(
            user=self.other_user,
            title="Other Task",
            description="Other Description",
        )

    def test_list_tasks_unauthenticated(self):
        """Test: listar tareas sin autenticar retorna 401."""
        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_tasks_authenticated(self):
        """Test: usuario autenticado puede listar sus tareas."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Test Task")

    def test_list_tasks_only_own_tasks(self):
        """Test: usuario solo ve sus propias tareas."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        # No debe incluir la tarea de otro usuario
        task_titles = [task["title"] for task in response.data]
        self.assertNotIn("Other Task", task_titles)

    def test_list_tasks_superuser_sees_all(self):
        """Test: superusuario puede ver todas las tareas."""
        superuser = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123",
        )
        self.client.force_authenticate(user=superuser)
        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_task_unauthenticated(self):
        """Test: crear tarea sin autenticar retorna 401."""
        data = {
            "title": "New Task",
            "description": "New Description",
        }
        response = self.client.post("/api/tasks/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_task_authenticated(self):
        """Test: usuario autenticado puede crear tarea."""
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "New Task",
            "description": "New Description",
        }
        response = self.client.post("/api/tasks/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Task")
        self.assertEqual(response.data["user"], "testuser")

    def test_create_task_sets_current_user(self):
        """Test: la tarea se crea asignada al usuario actual."""
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "New Task",
        }
        response = self.client.post("/api/tasks/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(id=response.data["id"])
        self.assertEqual(task.user, self.user)

    def test_create_task_title_required(self):
        """Test: title es requerido al crear tarea."""
        self.client.force_authenticate(user=self.user)
        data = {
            "description": "Description without title",
        }
        response = self.client.post("/api/tasks/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_retrieve_task(self):
        """Test: obtener detalle de una tarea."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/tasks/{self.task.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Task")

    def test_retrieve_other_user_task_forbidden(self):
        """Test: no se puede obtener tarea de otro usuario."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/tasks/{self.other_task.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_task(self):
        """Test: actualizar una tarea."""
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "Updated Title",
            "completed": True,
        }
        response = self.client.patch(f"/api/tasks/{self.task.id}/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, "Updated Title")
        self.assertTrue(self.task.completed)

    def test_update_other_user_task_forbidden(self):
        """Test: no se puede actualizar tarea de otro usuario."""
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "Hacked Title",
        }
        response = self.client.patch(f"/api/tasks/{self.other_task.id}/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_task(self):
        """Test: eliminar una tarea."""
        self.client.force_authenticate(user=self.user)
        task_id = self.task.id
        response = self.client.delete(f"/api/tasks/{task_id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_delete_other_user_task_forbidden(self):
        """Test: no se puede eliminar tarea de otro usuario."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f"/api/tasks/{self.other_task.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        # La tarea del otro usuario no debe ser eliminada
        self.assertTrue(Task.objects.filter(id=self.other_task.id).exists())

    def test_user_cannot_reassign_task(self):
        """Test: usuario no puede reasignar su tarea a otro usuario."""
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "Same Title",
            "user": self.other_user.id,  # Intentar cambiar el usuario
        }
        self.client.patch(f"/api/tasks/{self.task.id}/", data, format="json")

        # El campo user es read-only, así que no debe cambiar
        self.task.refresh_from_db()
        self.assertEqual(self.task.user, self.user)
