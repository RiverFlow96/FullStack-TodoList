import logging

from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .ai_service import (
    AIServiceError,
    ProviderAuthError,
    ProviderNotConfiguredError,
    ProviderQuotaError,
    ProviderTimeoutError,
    suggest_task,
)
from .models import Task
from .serializers import (
    AISuggestTaskRequestSerializer,
    AISuggestTaskResponseSerializer,
    TaskSerializer,
    UserSerializer,
)


logger = logging.getLogger(__name__)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Task.objects.all()
        return Task.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.is_superuser:
            return super().get_object()
        return self.request.user

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def list(self, request, *args, **kwargs):
        if request.user.is_superuser:
            return super().list(request, *args, **kwargs)
        return Response(
            {"detail": "Usa el endpoint /api/users/me/ para consultar tu perfil."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
        if request.user.is_superuser:
            return super().destroy(request, *args, **kwargs)
        return Response(
            {"detail": "No puedes eliminar tu perfil desde este endpoint."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "detail": "Cuenta creada correctamente.",
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="me", url_name="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class AppTokenObtainPairView(TokenObtainPairView):
    pass


class AISuggestTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request_serializer = AISuggestTaskRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        payload = request_serializer.validated_data
        context = payload.get("context", {})
        existing_tasks = context.get("existingTasks", [])

        try:
            suggestion = suggest_task(
                prompt=payload["prompt"],
                existing_tasks=existing_tasks,
            )
        except ProviderNotConfiguredError as exc:
            logger.warning("AI provider not configured: %s", exc)
            return Response(
                {"detail": "Proveedor IA no configurado en el servidor."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ProviderTimeoutError as exc:
            logger.warning("AI provider timeout: %s", exc)
            return Response(
                {"detail": "La solicitud al proveedor IA excedio el tiempo limite."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except ProviderQuotaError as exc:
            logger.warning("AI provider quota reached: %s", exc)
            return Response(
                {"detail": "Se alcanzo el limite de cuota del proveedor IA."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        except ProviderAuthError as exc:
            logger.warning("AI provider auth error: %s", exc)
            return Response(
                {"detail": "Credenciales IA invalidas o sin permisos en el proveedor."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except AIServiceError as exc:
            logger.warning("AI service error: %s", exc)
            response_payload = {
                "detail": "No se pudo generar una sugerencia en este momento."
            }
            if settings.DEBUG:
                response_payload["debug"] = str(exc)
            return Response(
                response_payload,
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception:
            logger.exception("Unexpected AI suggestion error")
            return Response(
                {"detail": "Error interno al generar sugerencia."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_serializer = AISuggestTaskResponseSerializer(data=suggestion)
        if not response_serializer.is_valid():
            return Response(
                {"detail": "Respuesta IA con formato invalido."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(response_serializer.validated_data, status=status.HTTP_200_OK)
