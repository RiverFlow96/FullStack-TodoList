# Backend setup script para Windows
# Crea entorno virtual en backend/.venv e instala dependencias
$ErrorActionPreference = "Stop"

# Moverse al directorio raíz del proyecto
Set-Location "$PSScriptRoot\.."

Write-Host "Configurando entorno del proyecto..."

# Backend setup
Write-Host ""
Write-Host "─────────────────────────────────────────"
Write-Host "Backend Configuration"
Write-Host "─────────────────────────────────────────"

# Moverse al directorio backend
Set-Location "./backend"

# Crear entorno virtual si no existe
if (-not (Test-Path ".venv")) {
    Write-Host "Creando entorno virtual en backend/.venv..."
    python -m venv .venv
} else {
    Write-Host "Entorno virtual ya existe"
}

# Activar entorno virtual
Write-Host "Activando entorno virtual..."
& .\.venv\Scripts\Activate.ps1

# Instalar dependencias base + dev
Write-Host "Instalando dependencias..."
python -m pip install --upgrade pip hatchling
python -m pip install -e "../[dev]"

Write-Host ""
Write-Host "Entorno completamente configurado!"
Write-Host ""
Write-Host "Proximos pasos:"
Write-Host "  Backend: .\backend\.venv\Scripts\Activate.ps1"
