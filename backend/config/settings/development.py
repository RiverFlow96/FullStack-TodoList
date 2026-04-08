"""
Django development settings.

Usage (Windows PowerShell):
    $env:DJANGO_SETTINGS_MODULE = "config.settings.development"
    python manage.py runserver

Usage (Linux/macOS):
    export DJANGO_SETTINGS_MODULE=config.settings.development
    python manage.py runserver

Or via Makefile (default):
    make runserver
"""

from copy import deepcopy

from .base import *  # noqa: F403
from .base import BASE_DIR, REST_FRAMEWORK
from .base import LOGGING as BASE_LOGGING

# =============================================================================
# DEBUG MODE
# =============================================================================

DEBUG = True

# =============================================================================
# ALLOWED HOSTS
# =============================================================================

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]

# =============================================================================
# DATABASE (SQLite for development)
# =============================================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# =============================================================================
# CORS CONFIGURATION (Allow all in development)
# =============================================================================

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# CSRF (Development)
# =============================================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# =============================================================================
# REST FRAMEWORK (Development overrides)
# =============================================================================

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]

# Disable throttling in development
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {}

# =============================================================================
# EMAIL (Console backend for development)
# =============================================================================

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# =============================================================================
# CACHING (Local memory for development)
# =============================================================================

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# =============================================================================
# DEBUG TOOLBAR (Optional)
# =============================================================================

try:
    import debug_toolbar  # noqa: F401

    INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa: F405
    INTERNAL_IPS = ["127.0.0.1", "localhost"]
except ImportError:
    pass

# =============================================================================
# LOGGING (Verbose in development)
# =============================================================================

LOGGING = deepcopy(BASE_LOGGING)

if LOGGING.get("handlers") and LOGGING["handlers"].get("console"):
    LOGGING["handlers"]["console"]["level"] = "DEBUG"

if LOGGING.get("loggers") and LOGGING["loggers"].get("apps"):
    LOGGING["loggers"]["apps"]["level"] = "DEBUG"

if LOGGING.get("loggers"):
    LOGGING["loggers"]["django.db.backends"] = {
        "handlers": ["console"],
        "level": "WARNING",  # Set to DEBUG to see SQL queries
        "propagate": False,
    }

print("Using DEVELOPMENT settings")
