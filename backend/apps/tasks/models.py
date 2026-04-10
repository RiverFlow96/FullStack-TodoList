from django.contrib.auth.models import User
from django.db import models


class TaskGroup(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="task_groups",
    )
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, blank=True, null=True)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["position", "created_at"]
        unique_together = ["user", "name"]

    def __str__(self):
        return self.name


class Task(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    group = models.ForeignKey(
        TaskGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    # Auto_now_add asigna automaticamente la fecha y hora actual, no se puede cambiar ni actualizar
    created_at = models.DateTimeField(auto_now_add=True)
    # Auto_now actualiza automaticamente la fecha y hora cada vez que se guarda la informacion
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    # Meta define el orden por defecto en que se mostran los objetos cuando se hacen consultas
    class Meta:
        ordering = ["-created_at"]
