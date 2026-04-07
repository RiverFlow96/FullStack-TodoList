"""
URL configuration for FullStack TodoList API.

https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.assistant.views import AISuggestTaskAPIView
from apps.accounts.views import AppTokenObtainPairView, UserViewSet
from apps.tasks.views import TaskViewSet

# =============================================================================
# ROUTER
# =============================================================================

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"users", UserViewSet, basename="user")

# =============================================================================
# URL PATTERNS
# =============================================================================

urlpatterns = [
    # Root redirect
    path("", RedirectView.as_view(url="/api/docs/", permanent=False)),
    # Admin
    path("admin/", admin.site.urls),
    # API (router-based viewsets)
    path("api/", include(router.urls)),
    # Authentication
    path("api/token/", AppTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api-auth/", include("rest_framework.urls")),
    # AI
    path("api/ai/suggest-task/", AISuggestTaskAPIView.as_view(), name="ai-suggest-task"),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
