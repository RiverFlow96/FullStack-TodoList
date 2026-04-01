
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action 
from rest_framework.response import Response 
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Task
from .serializers import TaskSerializer, UserSerializer
from django.contrib.auth.models import User

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

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def create(self, request, *args, **kwargs):
        # Permitir crear usuarios sin autenticación
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='me', url_name='me')
    def me(self,request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)