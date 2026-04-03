# ToDo List - FullStack App

> Aplicación web fullstack para gestión de tareas con autenticación de usuarios.

## Demo

![Captura de la app](frontend/public/Screenshot.png)

## Qué hace esta aplicación

Permite a los usuarios crear, editar, completar y eliminar tareas personales. Cada usuario gestiona sus propias tareas con autenticación segura.

## Stack Tecnológico

**Frontend**
<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=react,vite,tailwind,zustand" />
  </a>
</p>

- **React 19** — Interfaz de usuario
- **Vite** — Build tool y dev server
- **Tailwind CSS 4** — Estilos
- **Zustand** — Estado global
- **React Router 7** — Navegación
- **React Hook Form + Zod** — Validación de formularios
- **Axios** — Cliente HTTP

**Backend**
<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=django,python,sqlite" />
  </a>
</p>

- **Django 5** — Framework backend
- **Django REST Framework** — API REST
- **SQLite** — Base de datos

## Estructura del proyecto

```
FullStack/
├── backend/           # API REST con Django
│   ├── todolistapi/   # Configuración principal
│   └── tasks/         # App de tareas (models, views, serializers)
└── frontend/          # App React
    └── src/
        ├── components/    # Componentes reutilizables
        ├── layouts/       # Layouts de página
        ├── pages/         # Páginas principales
        ├── store/         # Zustand store
        └── utils/         # Esquemas Zod
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\Activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Deploy (Render + Supabase + Cloudflare)

### 1) Backend en Render

- Root del servicio: `backend/`
- Build command: `./build.sh`
- Start command: `gunicorn todolistapi.wsgi:application --bind 0.0.0.0:$PORT`
- También puedes usar `render.yaml` en la raíz para autoconfigurar.

Variables mínimas en Render:

- `SECRET_KEY`
- `DEBUG=False`
- `DATABASE_URL` (cadena de conexión de Supabase)
- `ALLOWED_HOSTS=tu-backend.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://tu-frontend.pages.dev`
- `CSRF_TRUSTED_ORIGINS=https://tu-backend.onrender.com`

### 2) Base de datos en Supabase (PostgreSQL)

- Crea un proyecto en Supabase.
- Copia la URL de conexión PostgreSQL y pégala en `DATABASE_URL` de Render.
- Ejecuta migraciones (Render lo hace en `build.sh` con `python manage.py migrate`).

### 3) Frontend en Cloudflare Pages

- Project root: `frontend/`
- Build command: `npm run build` (o `bun run build`)
- Output directory: `dist`
- Env var: `VITE_API_URL=https://tu-backend.onrender.com/api/`

Se incluye `frontend/public/_redirects` con `/* /index.html 200` para soportar rutas SPA de React Router.

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/users/` | Registro de usuario |
| POST | `/api/auth/login/` | Login |
| GET | `/api/users/me/` | Datos del usuario actual |
| GET | `/api/tasks/` | Listar tareas |
| POST | `/api/tasks/` | Crear tarea |
| PUT | `/api/tasks/{id}/` | Actualizar tarea |
| DELETE | `/api/tasks/{id}/` | Eliminar tarea |

## Características

- Autenticación de usuarios (registro/login)
- CRUD completo de tareas
- Estado de completada/no completada
- Rutas protegidas
- Validación de formularios con Zod
- Diseño responsivo con Tailwind CSS
- Estado global con Zustand

## Aprendido

- Integración Django REST + React
- Autenticación JWT con Django
- Zustand para estado global en React
- Tailwind CSS v4
- React Router v7
