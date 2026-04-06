"""
Django settings for todolistapi project.
"""

from pathlib import Path
import os
from urllib.parse import urlsplit
from dotenv import load_dotenv
import dj_database_url


load_dotenv()


def env_str(name, default=""):
    value = os.getenv(name, default)
    if not isinstance(value, str):
        return value
    return value.strip().strip('"').strip("'")


def parse_env_list(name):
    return [item.strip() for item in env_str(name, "").split(",") if item.strip()]


def normalize_origin(origin):
    value = origin.strip().strip('"').strip("'")
    if not value:
        return ""

    parts = urlsplit(value)
    if parts.scheme and parts.netloc:
        return f"{parts.scheme}://{parts.netloc}".rstrip("/")

    return value.rstrip("/")


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env_str(
    "SECRET_KEY", "django-insecure--sl%gjkw(-apa$5ce#md#cl(_d2fk#q5d&m!x^y*b@@d4j@1ek"
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Get allowed hosts from environment variable or use safe defaults
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

render_hostname = os.getenv("RENDER_EXTERNAL_HOSTNAME")
if render_hostname and render_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_hostname)

ALLOWED_HOSTS = [host.strip('"').strip("'") for host in ALLOWED_HOSTS]

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "drf_spectacular",
    "tasks",
]

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

ROOT_URLCONF = "todolistapi.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "todolistapi.wsgi.application"


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

# Use PostgreSQL in production, SQLite in development
database_url = os.getenv("DATABASE_URL")
if database_url:
    DATABASES = {
        "default": dj_database_url.parse(
            database_url, conn_max_age=600, ssl_require=True
        )
    }
elif os.getenv("DB_ENGINE") == "django.db.backends.postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "postgres"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CORS configuration for production
cors_origins = [
    normalize_origin(origin) for origin in parse_env_list("CORS_ALLOWED_ORIGINS")
]
cors_origin_regexes = parse_env_list("CORS_ALLOWED_ORIGIN_REGEXES")

if cors_origins or cors_origin_regexes:
    CORS_ALLOW_ALL_ORIGINS = False
    if cors_origins:
        CORS_ALLOWED_ORIGINS = cors_origins
    if cors_origin_regexes:
        CORS_ALLOWED_ORIGIN_REGEXES = cors_origin_regexes
else:
    CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = [
    normalize_origin(origin) for origin in parse_env_list("CSRF_TRUSTED_ORIGINS")
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated"  # Esto fuerza que todos los endpoints requieran autenticación
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "FullstackTodoList API",
    "DESCRIPTION": "API para gestionar tareas y usuarios",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # Opcional: personalizar el nombre de la cookie de JWT si usas autenticación en Swagger
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,  # para mantener el token al recargar
    },
}

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

EMAIL_BACKEND = env_str("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env_str("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_HOST_USER = env_str("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = env_str("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", 10))
DEFAULT_FROM_EMAIL = env_str(
    "DEFAULT_FROM_EMAIL", EMAIL_HOST_USER or "no-reply@example.com"
)
