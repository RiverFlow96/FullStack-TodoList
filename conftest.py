"""
Configuración raíz de pytest para el proyecto FullStack.
"""

import os
import sys
from pathlib import Path

# Agregar backend al path ANTES de que pytest-django intente importar
BACKEND_DIR = Path(__file__).resolve().parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Asegurar que Django sabe dónde están los settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
