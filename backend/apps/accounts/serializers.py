from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        email = value.strip().lower()
        users_with_email = User.objects.filter(email__iexact=email)
        if self.instance is not None:
            users_with_email = users_with_email.exclude(pk=self.instance.pk)
        if users_with_email.exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return email

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "La contraseña es obligatoria"})
        if "password" in attrs:
            user = User(
                username=attrs.get("username", getattr(self.instance, "username", "")),
                email=attrs.get("email", getattr(self.instance, "email", "")),
            )
            try:
                validate_password(attrs["password"], user=user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"password": exc.messages}) from exc
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password is not None:
            instance.set_password(password)
            instance.save(update_fields=["password"])
        return instance
