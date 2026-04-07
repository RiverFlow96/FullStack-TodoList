from rest_framework import serializers


class ExistingTaskContextSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True, allow_null=True)
    completed = serializers.BooleanField(required=False)


class AISuggestTaskContextSerializer(serializers.Serializer):
    existingTasks = ExistingTaskContextSerializer(many=True, required=False)


class AISuggestTaskRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=1000, trim_whitespace=True)
    context = AISuggestTaskContextSerializer(required=False)

    def validate_prompt(self, value):
        if not value.strip():
            raise serializers.ValidationError("El prompt no puede estar vacio.")
        return value.strip()


class AISuggestTaskResponseSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True)
    priority = serializers.ChoiceField(choices=["low", "medium", "high"])
    subtasks = serializers.ListField(
        child=serializers.CharField(max_length=200, allow_blank=False),
        allow_empty=True,
    )
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50, allow_blank=False),
        allow_empty=True,
    )
