# Un serializer es utilizado para exportar la informacion de los modelos como formato JSON a la API
from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fieldd = ['user', 'created_at', 'updated_at']

