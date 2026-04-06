# Build script para Windows
$ErrorActionPreference = "Stop"

# Moverse al directorio raíz del proyecto
Set-Location "$PSScriptRoot\..\.."

# Instalar dependencias base + producción
pip install ".[prod]"

# Moverse al directorio del backend
Set-Location backend

# Recopilar archivos estáticos
python manage.py collectstatic --noinput

# Ejecutar migraciones
python manage.py migrate
