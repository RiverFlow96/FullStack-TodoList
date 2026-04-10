#!/bin/bash
# Backend setup script para Linux/macOS
# Usa .venv en la raíz del proyecto
set -e

# Moverse al directorio raíz del proyecto
cd "$(dirname "$0")/.."

echo "Configurando entorno del proyecto..."

# Backend setup
echo ""
echo "─────────────────────────────────────────"
echo "Backend Configuration"
echo "─────────────────────────────────────────"

# Crear entorno virtual si no existe
if [ ! -d ".venv" ]; then
    echo "Creando entorno virtual en .venv..."
    python3 -m venv .venv
else
    echo "Entorno virtual ya existe"
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source .venv/bin/activate

# Instalar dependencias base + dev
echo "Instalando dependencias..."
python3 -m pip install --upgrade pip hatchling
python3 -m pip install -e ".[dev]"

echo ""
echo "Entorno completamente configurado!"
echo ""
echo "Proximos pasos:"
echo "  Backend: source .venv/bin/activate"
