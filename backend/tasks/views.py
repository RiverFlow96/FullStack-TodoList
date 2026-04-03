
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
        if self.action in ['create', 'verify_email', 'resend_verification']:
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
        self._send_verification_email(user)
        return Response(
            {
                "detail": "Cuenta creada. Revisa tu correo para verificar tu email.",
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
    
    @action(detail=False, methods=['get'], url_path='me', url_name='me')
    def me(self,request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='verify-email')
    def verify_email(self, request):
        uid = request.query_params.get('uid')
        token = request.query_params.get('token')

        if not uid or not token:
            return Response({"detail": "Enlace inválido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Enlace inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=['is_active'])
            return Response({"detail": "Email verificado correctamente"}, status=status.HTTP_200_OK)

        return Response({"detail": "Enlace inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='resend-verification')
    def resend_verification(self, request):
        email = request.data.get('email', '').strip().lower()
        username = request.data.get('username', '').strip()

        user = None
        if email:
            user = User.objects.filter(email__iexact=email).first()
        elif username:
            user = User.objects.filter(username=username).first()

        if user and not user.is_active:
            self._send_verification_email(user)

        return Response(
            {"detail": "Si el correo existe y no está verificado, enviaremos un nuevo enlace."},
            status=status.HTTP_200_OK,
        )

    def _send_verification_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verification_url = f"{settings.FRONTEND_URL}/auth/verify?uid={uid}&token={token}"

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