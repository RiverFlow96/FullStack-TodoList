"""
Tests para los modelos de la aplicación tasks.
"""

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from ..models import Task


class TaskModelTests(TestCase):
    """Tests para el modelo Task."""

    def setUp(self):
        """Configura los datos de prueba."""
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )

    def test_task_creation(self):
        """Test: crear una tarea correctamente."""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            description="Test Description",
        )

        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.description, "Test Description")
        self.assertEqual(task.user, self.user)
        self.assertFalse(task.completed)

    def test_task_str_representation(self):
        """Test: representación en string del modelo Task."""
        task = Task.objects.create(
            user=self.user,
            title="My Test Task",
        )

        self.assertEqual(str(task), "My Test Task")

    def test_task_default_completed_is_false(self):
        """Test: el estado completado por defecto es False."""
        task = Task.objects.create(
            user=self.user,
            title="New Task",
        )

        self.assertFalse(task.completed)

    def test_task_completed_toggle(self):
        """Test: cambiar el estado de completado."""
        task = Task.objects.create(
            user=self.user,
            title="Task to Complete",
        )

        self.assertFalse(task.completed)
        task.completed = True
        task.save()

        task.refresh_from_db()
        self.assertTrue(task.completed)

    def test_task_description_can_be_blank(self):
        """Test: la descripción puede estar vacía."""
        task = Task.objects.create(
            user=self.user,
            title="Task without description",
        )

        self.assertIsNone(task.description)

    def test_task_created_at_is_set_automatically(self):
        """Test: created_at se asigna automáticamente."""
        before_creation = timezone.now()
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
        )
        after_creation = timezone.now()

        self.assertIsNotNone(task.created_at)
        self.assertGreaterEqual(task.created_at, before_creation)
        self.assertLessEqual(task.created_at, after_creation)

    def test_task_updated_at_is_set_automatically(self):
        """Test: updated_at se asigna automáticamente."""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
        )
        original_updated_at = task.updated_at

        # Esperar un poco y actualizar
        import time

        time.sleep(0.1)

        task.title = "Updated Title"
        task.save()

        task.refresh_from_db()
        self.assertGreater(task.updated_at, original_updated_at)

    def test_task_cascade_delete_with_user(self):
        """Test: eliminar usuario elimina sus tareas."""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
        )

        task_id = task.id
        self.user.delete()

        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_task_max_title_length(self):
        """Test: el título tiene un máximo de 200 caracteres."""
        long_title = "a" * 201
        task = Task(
            user=self.user,
            title=long_title,
        )

        from django.core.exceptions import ValidationError

        with self.assertRaises(ValidationError):
            task.full_clean()

    def test_multiple_tasks_per_user(self):
        """Test: un usuario puede tener múltiples tareas."""
        task1 = Task.objects.create(
            user=self.user,
            title="Task 1",
        )
        task2 = Task.objects.create(
            user=self.user,
            title="Task 2",
        )

        user_tasks = Task.objects.filter(user=self.user)
        self.assertEqual(user_tasks.count(), 2)
        self.assertIn(task1, user_tasks)
        self.assertIn(task2, user_tasks)

    def test_tasks_ordered_by_created_at_descending(self):
        """Test: las tareas se ordenan por created_at descendente."""
        task1 = Task.objects.create(
            user=self.user,
            title="Older Task",
        )
        task2 = Task.objects.create(
            user=self.user,
            title="Newer Task",
        )

        # Obtener todas las tareas (con el ordenamiento por defecto)
        all_tasks = list(Task.objects.all())

        # La tarea más nueva debe aparecer primero
        self.assertEqual(all_tasks[0].id, task2.id)
        self.assertEqual(all_tasks[1].id, task1.id)
