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

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        owner_id = (
            self.instance.user_id
            if isinstance(self.instance, Task)
            else getattr(getattr(request, "user", None), "id", None)
        )
        fields["group"].queryset = TaskGroup.objects.filter(user_id=owner_id) if owner_id else TaskGroup.objects.none()
        return fields

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]
