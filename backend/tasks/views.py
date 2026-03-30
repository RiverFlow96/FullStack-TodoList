from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer

# Create your views here.
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Task.objects.all()
        # Cada usuario solo ve sus propias tarea
        return Task.objects.filter(user=user)
            
    def perform_create(self, serializer):
        # Asigna el usuario autenticado al crear
        serializer.save(user=self.request.user)