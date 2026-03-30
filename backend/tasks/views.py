from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer

# Create your views here.
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Cada usuario solo ve sus propias tarea
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Asigna el usuario autenticado al crear
        serializer.save(user=self.request.user)