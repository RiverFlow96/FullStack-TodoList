import logging

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_service import (
    AIServiceError,
    ProviderAuthError,
    ProviderNotConfiguredError,
    ProviderQuotaError,
    ProviderTimeoutError,
    suggest_task,
)
from .serializers import (
    AISuggestTaskRequestSerializer,
    AISuggestTaskResponseSerializer,
)

logger = logging.getLogger(__name__)


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
            response_payload = {"detail": "No se pudo generar una sugerencia en este momento."}
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
