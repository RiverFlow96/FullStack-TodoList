"""
Configuración de pytest para Django.
"""

import os
import sys
from pathlib import Path

import django

# Agregar el directorio backend al path de importación
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Configurar Django ANTES de importar cualquier modelo
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

try:
    django.setup()
except RuntimeError:
    pass  # Django ya está configurado
