"""
Django base settings for this project.

Do not import this module directly. Use development.py or production.py instead.
"""

import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlsplit

from typing import Dict, Any

from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# =============================================================================
# ENVIRONMENT UTILITIES
# =============================================================================


def env_str(name: str, default: str = "") -> str:
    """Get string from environment, stripping quotes and whitespace."""
    value = os.getenv(name, default)
    if not isinstance(value, str):
        return value
    return value.strip().strip('"').strip("'")


def env_bool(name: str, default: bool = False) -> bool:
    """Get boolean from environment."""
    return os.getenv(name, str(default)).lower() in ("true", "1", "yes", "on")


def env_int(name: str, default: int = 0) -> int:
    """Get integer from environment."""
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def env_list(name: str, default: str = "") -> list[str]:
    """Get comma-separated list from environment."""
    value = env_str(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


def normalize_origin(origin: str) -> str:
    """Normalize URL origin by removing trailing slashes and paths."""
    value = origin.strip().strip('"').strip("'")
    if not value:
        return ""

    parts = urlsplit(value)
    if parts.scheme and parts.netloc:
        return f"{parts.scheme}://{parts.netloc}".rstrip("/")

    return value.rstrip("/")


# =============================================================================
# PATH CONFIGURATION
# =============================================================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR points to /backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# =============================================================================
# CORE SETTINGS
# =============================================================================

SECRET_KEY = env_str(
    "SECRET_KEY", "django-insecure-change-me-in-production-please-use-a-secure-key"
)

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "drf_spectacular",
    "django_filters",
]

LOCAL_APPS = [
    "apps.core",
    "apps.accounts",
    "apps.tasks",
    "apps.assistant",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# =============================================================================
# MIDDLEWARE
# =============================================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# =============================================================================
# URL & WSGI/ASGI
# =============================================================================

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# =============================================================================
# TEMPLATES
# =============================================================================

# Templates configuration (if needed for admin or future frontend integration)
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# =============================================================================
# PASSWORD VALIDATION
# https://docs.djangoproject.com/en/6.0/topics/auth/passwords/#password-validation
# =============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# =============================================================================
# INTERNATIONALIZATION
# https://docs.djangoproject.com/en/6.0/topics/i18n/
# =============================================================================

LANGUAGE_CODE = "es-mx"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# =============================================================================
# STATIC FILES (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/
# =============================================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

# =============================================================================
# DEFAULT PRIMARY KEY
# =============================================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================

REST_FRAMEWORK = {
    # Authentication
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    # Permissions
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Filtering
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    # Pagination
    # Future: Add custom pagination class for consistent pagination style across the API
    # "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",
    # "PAGE_SIZE": 20,
    # Throttling
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
    # Schema
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Renderers
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    # Exception handling
    # Future: Add custom exception handler for consistent error responses
    # "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
}

# =============================================================================
# SIMPLE JWT
# =============================================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env_int("JWT_ACCESS_TOKEN_LIFETIME", 30)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env_int("JWT_REFRESH_TOKEN_LIFETIME", 7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# =============================================================================
# DRF SPECTACULAR (API DOCUMENTATION)
# =============================================================================

SPECTACULAR_SETTINGS = {
    "TITLE": "FullStack TodoList API",
    "DESCRIPTION": "API REST para gestionar tareas y usuarios con autenticación JWT",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # If the API is under a specific path (e.g. /api/), you can set the SCHEMA_PATH_PREFIX to ensure correct schema generation
    # "SCHEMA_PATH_PREFIX": r"/api/",
    "COMPONENT_SPLIT_REQUEST": True,
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True, # Keep the JWT token in Swagger UI even after page reload
        "filter": True, # Enable search/filter box in Swagger UI
        "deepLinking": True, # Enable deep linking for tags and operations in Swagger UI
    },
    # TODO: Split tags into separate groups (e.g. auth, users, tasks, ai) for better organization in Swagger UI
    # "TAGS": [
    #     {"name": "auth", "description": "Autenticación y tokens JWT"},
    #     {"name": "users", "description": "Gestión de usuarios"},
    #     {"name": "tasks", "description": "Gestión de tareas"},
    #     {"name": "ai", "description": "Servicios de inteligencia artificial"},
    # ],
}

# =============================================================================
# EMAIL (BASE CONFIGURATION)
# =============================================================================

EMAIL_BACKEND = env_str("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env_str("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = env_int("EMAIL_PORT", 587)
EMAIL_HOST_USER = env_str("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = env_str("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_TIMEOUT = env_int("EMAIL_TIMEOUT", 10)
DEFAULT_FROM_EMAIL = env_str(
    "DEFAULT_FROM_EMAIL", EMAIL_HOST_USER or "no-reply@example.com"
)

# =============================================================================
# LOGGING (BASE CONFIGURATION)
# =============================================================================

LOGGING: Dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "filters": {
        "require_debug_false": {
            "()": "django.utils.log.RequireDebugFalse",
        },
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "mail_admins"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "mail_admins"],
            "level": "ERROR",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# =============================================================================
# AI SERVICE CONFIGURATION
# =============================================================================

AI_CONFIG = {
    "PROVIDER": env_str("LLM_PROVIDER", "openai"),
    "TIMEOUT_SECONDS": env_int("LLM_TIMEOUT_SECONDS", 20),
    # OpenAI
    "OPENAI_API_KEY": env_str("OPENAI_API_KEY"),
    "OPENAI_MODEL": env_str("OPENAI_MODEL", "gpt-4o-mini"),
    # Gemini
    "GEMINI_API_KEY": env_str("GEMINI_API_KEY"),
    "GEMINI_MODEL": env_str("GEMINI_MODEL", "gemini-1.5-flash"),
    # Azure OpenAI
    "AZURE_OPENAI_API_KEY": env_str("AZURE_OPENAI_API_KEY"),
    "AZURE_OPENAI_ENDPOINT": env_str("AZURE_OPENAI_ENDPOINT"),
    "AZURE_OPENAI_DEPLOYMENT": env_str("AZURE_OPENAI_DEPLOYMENT"),
    "AZURE_OPENAI_API_VERSION": env_str("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
}
