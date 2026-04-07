"""
Django production settings.

Usage:
    export DJANGO_ENV=production
    gunicorn config.wsgi:application
"""

import os

import dj_database_url

from .base import *  # noqa: F401, F403
from .base import env_bool, env_list, env_str, normalize_origin

# =============================================================================
# DEBUG MODE
# =============================================================================

DEBUG = False

# =============================================================================
# SECURITY
# =============================================================================

SECRET_KEY = env_str("SECRET_KEY")
if not SECRET_KEY or "insecure" in SECRET_KEY.lower():
    raise ValueError("SECRET_KEY must be set to a secure value in production")

# =============================================================================
# ALLOWED HOSTS
# =============================================================================

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")

# Add Render hostname if present
render_hostname = os.getenv("RENDER_EXTERNAL_HOSTNAME")
if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)

# Clean up hosts
ALLOWED_HOSTS = [host.strip('"').strip("'") for host in ALLOWED_HOSTS if host]

# =============================================================================
# DATABASE (PostgreSQL for production)
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases
# =============================================================================

database_url = os.getenv("DATABASE_URL")
if database_url:
    DATABASES = {
        "default": dj_database_url.parse(
            database_url,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        )
    }
elif os.getenv("DB_ENGINE") == "django.db.backends.postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env_str("DB_NAME", "postgres"),
            "USER": env_str("DB_USER", "postgres"),
            "PASSWORD": env_str("DB_PASSWORD", ""),
            "HOST": env_str("DB_HOST", "localhost"),
            "PORT": env_str("DB_PORT", "5432"),
            "CONN_MAX_AGE": 600,
            "CONN_HEALTH_CHECKS": True,
            "OPTIONS": {
                "sslmode": "require",
            },
        }
    }
else:
    # Fallback to safe default (SQLite) if no database configuration is provided
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

cors_origins = [normalize_origin(origin) for origin in env_list("CORS_ALLOWED_ORIGINS")]
cors_regexes = env_list("CORS_ALLOWED_ORIGIN_REGEXES")

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

if cors_origins:
    CORS_ALLOWED_ORIGINS = cors_origins

if cors_regexes:
    CORS_ALLOWED_ORIGIN_REGEXES = cors_regexes

# =============================================================================
# CSRF
# =============================================================================

CSRF_TRUSTED_ORIGINS = [
    normalize_origin(origin) for origin in env_list("CSRF_TRUSTED_ORIGINS")
]

# =============================================================================
# SECURITY HEADERS
# =============================================================================

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"

# =============================================================================
# STATIC FILES
# =============================================================================

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# =============================================================================
# CACHING (Redis if available, otherwise local memory)
# =============================================================================

REDIS_URL = env_str("REDIS_URL")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "production-cache",
        }
    }

# =============================================================================
# LOGGING (Production - less verbose, more structured)
# =============================================================================

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "apps.core.logging.JsonFormatter",
        },
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
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

print("Using PRODUCTION settings")
