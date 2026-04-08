"""
Core app configuration.

This app contains shared utilities and base functionality for other apps.

TODO: Add custom error handling, and other core features as needed.
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
    label = "core"
