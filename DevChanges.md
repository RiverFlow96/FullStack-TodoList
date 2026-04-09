# Cambios por rama

Este documento resume los cambios realizados en las ramas `chore/ai-service` y `dev/chore-frontend`.

## IMPORTANTE

Se cambio el archivo pyproject por errores:
se cambio requires-python a <=3.12,<3.14, el error era debido a la version, ya que no permitia la version 3.14

## Rama: `chore/ai-service`

### Cambios principales de la rama

- **Integración de proveedor IA OpenRouter**
  - Se añadió `OpenRouterProvider` en `backend/tasks/ai_service.py`.
  - Se implementó la llamada a `https://openrouter.ai/api/v1/chat/completions`.
  - Se configuró el payload para respuestas en JSON y normalización de salida.
  - Se incorporó selección de proveedor con `LLM_PROVIDER=openrouter`.

- **Variables de entorno para OpenRouter**
  - Se agregaron variables en `backend/.env`:
    - `OPENROUTER_API_KEY`
    - `OPENROUTER_MODEL`
    - `OPENROUTER_SITE_URL`
    - `OPENROUTER_APP_NAME`

- **Configuración de despliegue en Render**
  - Se actualizó `render.yaml` con variables para OpenRouter y timeout:
    - `LLM_PROVIDER=openrouter`
    - `OPENROUTER_*`
    - `LLM_TIMEOUT_SECONDS=20`

### Commits relevantes

- `97421f9` feat(ai): add OpenRouter provider integration and configuration

---

## Rama: `dev/chore-frontend`

### Cambios principales de la rama

- **Mejora de UX en autenticación (frontend)**
  - Se agregó botón de mostrar/ocultar contraseña en `Login`.
  - Se agregó botón de mostrar/ocultar contraseña y confirmar contraseña en `Register`.
  - Se añadió enlace de “¿Olvidaste tu contraseña?” en la vista de login. (temporalmente, esta mal configurado hasta encontrar un proveedor de email que funcione)
  - Archivos modificados:
    - `frontend/src/layouts/LoginLayout.jsx`
    - `frontend/src/layouts/RegisterLayout.jsx`

- **Limpieza/chore adicional en la rama**
  - Se limpiaron archivos y cambios de mantenimiento:
    - `.gitignore`
    - `DevChanges.md`
    - `frontend/README.md`
    - `frontend/index.html`
    - `frontend/public/Screenshot.png`
    - `frontend/public/favicon.svg`
    - `frontend/public/icons.svg`
    - `pyproject.toml`
    - `uv.lock`

### Commits relevantes

- `e5d013a` feat(layout): add password visibility toggle and forgot password link
- `1c60c79` chore: clean up unused code and remove empty change logs

---

## Base compartida heredada por ambas ramas

Ambas ramas incluyen commits previos provenientes de `dmsudev/refactor` (mergeado), con mejoras de tooling, CI y formateo, por ejemplo:

- `af95aab` actualización de CI + CodeQL
- `0cba2d8` ajuste de build en `render.yaml`
- `794322c` ajustes de lint (Ruff / Meta class)
- `f652743` cambios en hooks de pre-commit
- `70163f3` refactor general de imports/formato

Estos cambios no son exclusivos de una sola rama, pero forman parte del historial de ambas.
