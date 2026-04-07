from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]
