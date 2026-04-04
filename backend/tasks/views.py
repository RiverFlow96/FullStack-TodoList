from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Task
from .serializers import TaskSerializer, UserSerializer
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
import logging
import json
from urllib import error as urllib_error
from urllib import request as urllib_request

logger = logging.getLogger(__name__)


class VerifiedTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise AuthenticationFailed("Tu cuenta no está verificada. Revisa tu email.")
        return data


class VerifiedTokenObtainPairView(TokenObtainPairView):
    serializer_class = VerifiedTokenObtainPairSerializer


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
        if self.action in ["create", "verify_email", "resend_verification"]:
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
        user = serializer.save()
        logger.info(
            "Nuevo registro de usuario pendiente de verificación",
            extra={"username": user.username, "email": user.email},
        )

        email_sent = self._send_verification_email(user)
        detail_message = "Cuenta creada. Revisa tu correo para verificar tu email."
        if not email_sent:
            detail_message = "Cuenta creada, pero no pudimos enviar el correo ahora. Usa 'Reenviar verificación'."
            logger.warning(
                "No se pudo enviar correo de verificación al registrar",
                extra={"username": user.username, "email": user.email},
            )

        return Response(
            {
                "detail": detail_message,
                "email_sent": email_sent,
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="me", url_name="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="verify-email",
    )
    def verify_email(self, request):
        uid = request.query_params.get("uid")
        token = request.query_params.get("token")

        if not uid or not token:
            return Response(
                {"detail": "Enlace inválido"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Enlace inválido o expirado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if default_token_generator.check_token(user, token):
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=["is_active"])
            return Response(
                {"detail": "Email verificado correctamente"}, status=status.HTTP_200_OK
            )

        return Response(
            {"detail": "Enlace inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST
        )

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="resend-verification",
    )
    def resend_verification(self, request):
        email = request.data.get("email", "").strip().lower()
        username = request.data.get("username", "").strip()

        user = None
        if email:
            user = User.objects.filter(email__iexact=email).first()
        elif username:
            user = User.objects.filter(username=username).first()

        email_sent = False
        if user and not user.is_active:
            logger.info(
                "Reenvío de verificación solicitado",
                extra={"username": user.username, "email": user.email},
            )
            email_sent = self._send_verification_email(user)

        return Response(
            {
                "detail": "Si el correo existe y no está verificado, enviaremos un nuevo enlace.",
                "email_sent": email_sent,
            },
            status=status.HTTP_200_OK,
        )

    def _send_verification_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verification_url = (
            f"{settings.FRONTEND_URL}/auth/verify?uid={uid}&token={token}"
        )

        if settings.EMAIL_PROVIDER == "resend" and settings.RESEND_API_KEY:
            logger.info(
                "Enviando verificación con proveedor HTTPS",
                extra={
                    "provider": settings.EMAIL_PROVIDER,
                    "username": user.username,
                    "email": user.email,
                },
            )
            return self._send_verification_email_resend(user, verification_url)

        if settings.EMAIL_PROVIDER == "brevo" and settings.BREVO_API_KEY:
            logger.info(
                "Enviando verificación con proveedor HTTPS",
                extra={
                    "provider": settings.EMAIL_PROVIDER,
                    "username": user.username,
                    "email": user.email,
                },
            )
            return self._send_verification_email_brevo(user, verification_url)

        try:
            logger.info(
                "Intentando enviar correo de verificación",
                extra={"username": user.username, "email": user.email},
            )
            send_mail(
                subject="Verifica tu cuenta",
                message=(
                    f"Hola {user.username},\n\n"
                    f"Gracias por registrarte. Verifica tu cuenta aquí:\n{verification_url}\n\n"
                    "Si no solicitaste esta cuenta, ignora este mensaje."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(
                "Correo de verificación enviado correctamente",
                extra={"username": user.username, "email": user.email},
            )
            return True
        except Exception as exc:
            logger.exception(
                "Error enviando correo de verificación",
                extra={
                    "username": user.username,
                    "email": user.email,
                    "error": str(exc),
                },
            )
            return False

    def _send_verification_email_resend(self, user, verification_url):
        subject = "Verifica tu cuenta"
        body_text = (
            f"Hola {user.username},\n\n"
            f"Gracias por registrarte. Verifica tu cuenta aquí:\n{verification_url}\n\n"
            "Si no solicitaste esta cuenta, ignora este mensaje."
        )
        body_html = (
            f"<p>Hola {user.username},</p>"
            f'<p>Gracias por registrarte. Verifica tu cuenta <a href="{verification_url}">aquí</a>.</p>'
            "<p>Si no solicitaste esta cuenta, ignora este mensaje.</p>"
        )

        payload = {
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [user.email],
            "subject": subject,
            "text": body_text,
            "html": body_html,
        }
        headers = {
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        }

        try:
            req = urllib_request.Request(
                settings.RESEND_API_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib_request.urlopen(
                req, timeout=settings.EMAIL_TIMEOUT
            ) as response:
                status_code = response.getcode()
                if status_code in (200, 201, 202):
                    logger.info(
                        "Correo de verificación enviado con Resend",
                        extra={
                            "username": user.username,
                            "email": user.email,
                            "status_code": status_code,
                        },
                    )
                    return True

                raw_response = response.read().decode("utf-8", errors="ignore")
                logger.error(
                    "Respuesta inesperada de Resend",
                    extra={
                        "username": user.username,
                        "email": user.email,
                        "status_code": status_code,
                        "response": raw_response,
                    },
                )
                return False
        except urllib_error.HTTPError as exc:
            error_payload = exc.read().decode("utf-8", errors="ignore")
            logger.exception(
                "Error HTTP al enviar con Resend",
                extra={
                    "username": user.username,
                    "email": user.email,
                    "status_code": exc.code,
                    "response": error_payload,
                },
            )
            return False
        except Exception as exc:
            logger.exception(
                "Error enviando correo con Resend",
                extra={
                    "username": user.username,
                    "email": user.email,
                    "error": str(exc),
                },
            )
            return False

    def _send_verification_email_brevo(self, user, verification_url):
        subject = "Verifica tu cuenta"
        body_text = (
            f"Hola {user.username},\n\n"
            f"Gracias por registrarte. Verifica tu cuenta aquí:\n{verification_url}\n\n"
            "Si no solicitaste esta cuenta, ignora este mensaje."
        )
        body_html = (
            f"<p>Hola {user.username},</p>"
            f'<p>Gracias por registrarte. Verifica tu cuenta <a href="{verification_url}">aquí</a>.</p>'
            "<p>Si no solicitaste esta cuenta, ignora este mensaje.</p>"
        )

        payload = {
            "sender": {
                "name": "TodoList",
                "email": settings.DEFAULT_FROM_EMAIL,
            },
            "to": [{"email": user.email}],
            "subject": subject,
            "textContent": body_text,
            "htmlContent": body_html,
        }
        headers = {
            "api-key": settings.BREVO_API_KEY,
            "Content-Type": "application/json",
        }

        try:
            req = urllib_request.Request(
                settings.BREVO_API_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib_request.urlopen(
                req, timeout=settings.EMAIL_TIMEOUT
            ) as response:
                status_code = response.getcode()
                if status_code in (200, 201, 202):
                    logger.info(
                        "Correo de verificación enviado con Brevo",
                        extra={
                            "username": user.username,
                            "email": user.email,
                            "status_code": status_code,
                        },
                    )
                    return True

                raw_response = response.read().decode("utf-8", errors="ignore")
                logger.error(
                    "Respuesta inesperada de Brevo",
                    extra={
                        "username": user.username,
                        "email": user.email,
                        "status_code": status_code,
                        "response": raw_response,
                    },
                )
                return False
        except urllib_error.HTTPError as exc:
            error_payload = exc.read().decode("utf-8", errors="ignore")
            logger.exception(
                "Error HTTP al enviar con Brevo (status=%s, response=%s)",
                exc.code,
                error_payload,
                extra={
                    "username": user.username,
                    "email": user.email,
                    "status_code": exc.code,
                    "response": error_payload,
                },
            )
            return False
        except Exception as exc:
            logger.exception(
                "Error enviando correo con Brevo",
                extra={
                    "username": user.username,
                    "email": user.email,
                    "error": str(exc),
                },
            )
            return False
