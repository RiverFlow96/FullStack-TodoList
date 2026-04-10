from rest_framework import serializers

from .models import Task, TaskGroup


class TaskGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskGroup
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]


class TaskGroupReorderSerializer(serializers.Serializer):
    groups = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    class Meta:
        fields = ["groups"]


class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]
