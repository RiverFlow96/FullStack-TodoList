# Un serializer es utilizado para exportar la informacion de los modelos como formato JSON a la API
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return email

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError(
                {"password": "La contraseña es obligatoria"}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class ExistingTaskContextSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    description = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, allow_null=True
    )
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
