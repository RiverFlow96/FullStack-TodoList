#!/bin/bash
set -o errexit

# Moverse al directorio raíz del proyecto
cd "$(dirname "$0")/../.."

# Instalar dependencias base + producción
pip install ".[prod]"

# Moverse al directorio del backend
cd backend

# Recopilar archivos estáticos
python manage.py collectstatic --noinput

# Ejecutar migraciones
python manage.py migrate
