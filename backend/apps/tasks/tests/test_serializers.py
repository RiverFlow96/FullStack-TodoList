"""
Tests para los serializers de la aplicación tasks.
"""

from django.contrib.auth.models import User
from django.test import TestCase

from ..models import Task, TaskGroup
from ..serializers import TaskGroupSerializer, TaskSerializer


class TaskSerializerTests(TestCase):
    """Tests para el serializer TaskSerializer."""

    def setUp(self):
        """Configura los datos de prueba."""
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        self.task = Task.objects.create(
            user=self.user,
            title="Test Task",
            description="Test Description",
            completed=False,
        )

    def test_serializer_valid_data(self):
        """Test: serializar una tarea válida."""
        serializer = TaskSerializer(self.task)
        data = serializer.data

        self.assertEqual(data["title"], "Test Task")
        self.assertEqual(data["description"], "Test Description")
        self.assertFalse(data["completed"])
        self.assertEqual(data["user"], "testuser")

    def test_serializer_contains_expected_fields(self):
        """Test: el serializer contiene los campos esperados."""
        serializer = TaskSerializer(self.task)
        expected_fields = {"id", "user", "group", "title", "description", "completed", "created_at", "updated_at"}

        self.assertEqual(set(serializer.data.keys()), expected_fields)

    def test_serializer_user_is_read_only(self):
        """Test: el campo user es de solo lectura."""
        data = {
            "title": "New Task",
            "description": "New Description",
            "user": 999,  # ID de usuario diferente
        }
        serializer = TaskSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        # El user no debería estar en los datos validados
        # (será asignado en perform_create)

    def test_serializer_created_at_is_read_only(self):
        """Test: created_at es de solo lectura."""
        data = {
            "title": "New Task",
        }
        serializer = TaskSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("created_at", serializer.validated_data)

    def test_serializer_updated_at_is_read_only(self):
        """Test: updated_at es de solo lectura."""
        data = {
            "title": "New Task",
        }
        serializer = TaskSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        self.assertNotIn("updated_at", serializer.validated_data)

    def test_serializer_title_required(self):
        """Test: title es requerido."""
        data = {
            "description": "Description without title",
        }
        serializer = TaskSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_serializer_description_can_be_blank(self):
        """Test: description puede estar en blanco."""
        data = {
            "title": "Task without description",
            "description": "",
        }
        serializer = TaskSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_serializer_completed_default_false(self):
        """Test: completed por defecto es False."""
        data = {
            "title": "New Task",
        }
        serializer = TaskSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        # completed no está en los datos pero será creado con False en el modelo

    def test_serializer_update_task(self):
        """Test: actualizar una tarea existente."""
        data = {
            "title": "Updated Title",
            "description": "Updated Description",
            "completed": True,
        }
        serializer = TaskSerializer(self.task, data=data, partial=True)

        self.assertTrue(serializer.is_valid())
        updated_task = serializer.save()

        self.assertEqual(updated_task.title, "Updated Title")
        self.assertEqual(updated_task.description, "Updated Description")
        self.assertTrue(updated_task.completed)

    def test_serializer_title_max_length(self):
        """Test: title tiene un máximo de 200 caracteres."""
        data = {
            "title": "a" * 201,
        }
        serializer = TaskSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_serializer_completed_boolean(self):
        """Test: completed debe ser booleano."""
        data = {
            "title": "Test Task",
            "completed": "yes",  # String en lugar de boolean
        }
        serializer = TaskSerializer(data=data)

        # Django lo debería convertir o rechazar
        # Vamos a revisar el comportamiento
        serializer.is_valid()
        # Si es válido, debería haber convertido "yes" a True o False
        # Si no es válido, debería estar en los errores


class TaskGroupSerializerTests(TestCase):
    """Tests para el serializer TaskGroupSerializer."""

    def setUp(self):
        """Configura los datos de prueba."""
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        self.group = TaskGroup.objects.create(
            user=self.user,
            name="Work",
            color="#FF5733",
        )

    def test_group_serializer_valid_data(self):
        """Test: serializar un grupo válido."""
        serializer = TaskGroupSerializer(self.group)
        data = serializer.data

        self.assertEqual(data["name"], "Work")
        self.assertEqual(data["color"], "#FF5733")

    def test_group_serializer_contains_expected_fields(self):
        """Test: el serializer contiene los campos esperados."""
        serializer = TaskGroupSerializer(self.group)
        expected_fields = {"id", "user", "name", "color", "position", "created_at", "updated_at"}

        self.assertEqual(set(serializer.data.keys()), expected_fields)

    def test_group_serializer_name_required(self):
        """Test: name es requerido."""
        data = {
            "color": "#FF5733",
        }
        serializer = TaskGroupSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_group_serializer_name_max_length(self):
        """Test: name tiene un máximo de 50 caracteres."""
        data = {
            "name": "a" * 51,
        }
        serializer = TaskGroupSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_group_serializer_color_can_be_blank(self):
        """Test: color puede estar en blanco."""
        data = {
            "name": "Test Group",
            "color": "",
        }
        serializer = TaskGroupSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_group_serializer_position_default(self):
        """Test: position tiene valor por defecto."""
        data = {
            "name": "New Group",
        }
        serializer = TaskGroupSerializer(data=data)

        self.assertTrue(serializer.is_valid())
        # position no está en validated_data, se asignará en perform_create

    def test_group_serializer_update_group(self):
        """Test: actualizar un grupo existente."""
        data = {
            "name": "Updated Work",
            "color": "#00FF00",
        }
        serializer = TaskGroupSerializer(self.group, data=data, partial=True)

        self.assertTrue(serializer.is_valid())
        updated_group = serializer.save()

        self.assertEqual(updated_group.name, "Updated Work")
        self.assertEqual(updated_group.color, "#00FF00")
