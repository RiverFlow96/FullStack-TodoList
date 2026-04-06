# ToDo List App

[Readme Español](https://github.com/RiverFlow96/FullStack-TodoList/blob/main/README.md)
 • [English Readme](https://github.com/RiverFlow96/FullStack-TodoList/blob/main/README.en.md)

Aplicación web fullstack para gestión de tareas con autenticación de usuarios. Permite crear, editar, completar y eliminar tareas personales.

![Captura de la app](frontend/public/Screenshot.png)

## Características

- **Autenticación segura** Registro e inicio de sesión
- **Gestión completa de tareas** Crear, editar, completar y eliminar en tiempo real `(CRUD)`
- **Control de estado** Marcar tareas como completadas o no completadas
- **Rutas protegidas** Acceso exclusivo para usuarios autenticados
- **Validación robusta** Formularios validados con esquemas `Zod`
- **Diseño responsive** Interfaz adaptable con `Tailwind CSS` en todos los dispositivos
- **Estado global** Manejo eficiente con `Zustand`

## Estructura del proyecto

```graph
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

## Tecnologías

### Frontend

![Frontend Stack](https://skillicons.dev/icons?i=react,vite,tailwind)

| Tecnología            | Uso                       |
| --------------------- | ------------------------- |
| React 19              | Interfaz de usuario       |
| Vite                  | Build tool y dev server   |
| Tailwind CSS 4        | Estilos                   |
| Zustand               | Estado global             |
| React Router 7        | Navegación                |
| React Hook Form + Zod | Validación de formularios |
| Axios                 | Cliente HTTP              |

### Backend

![Backend Stack](https://skillicons.dev/icons?i=django,python,postgresql)

| Tecnología            | Uso               |
| --------------------- | ----------------- |
| Django 5              | Framework backend |
| Django REST Framework | API REST          |
| SQLite / PostgreSQL   | Base de datos     |

## Instalación

<details>
<summary><strong>Backend</strong></summary>

<br>

1 - Entrar al directorio y crear/activar el entorno virtual

```bash
cd backend
python -m venv .venv

source .venv/bin/activate # Linux/macOS
.venv\Scripts\Activate.ps1 # Windows
```

2 - Instala las dependencias

```bash
pip install -r requirements.txt
```

3 - Aplicar las migraciones

```bash
python manage.py migrate
```

4 - Iniciar el servidor

```bash
python manage.py runserver
```

El servidor estará disponible en http://localhost:8000

</details>

<details>
<summary><strong>Frontend</strong></summary>

<br>

1 - Entrar al directorio e instalar dependencias

```bash
cd frontend
npm install
```

2 - Inicia el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

</details>

## Deploy en Producción

<details>
<summary><strong>Backend en Render</strong></summary>

### Configuración del servicio

| Propiedad     | Valor                                                        |
| ------------- | ------------------------------------------------------------ |
| Root          | `backend/`                                                   |
| Build command | `./build.sh`                                                 |
| Start command | `gunicorn todolistapi.wsgi:application --bind 0.0.0.0:$PORT` |

### Variables de entorno

| Variable               | Valor                                                          |
| ---------------------- | -------------------------------------------------------------- |
| `SECRET_KEY`           | `tu-clave-secreta-muy-larga`                                   |
| `DEBUG`                | `False`                                                        |
| `DATABASE_URL`         | `postgresql://usuario:contraseña@db.supabase.co:5432/postgres` |
| `ALLOWED_HOSTS`        | `tu-backend.onrender.com`                                      |
| `CORS_ALLOWED_ORIGINS` | `https://tu-frontend.pages.dev`                                |
| `CSRF_TRUSTED_ORIGINS` | `https://tu-backend.onrender.com`                              |

> Tip: Puedes usar `render.yaml` en la raíz del proyecto para automatizar la configuración

</details>

<details>
<summary><strong>Base de datos en Supabase</strong></summary>

### Configuración de la base de datos

Para la base de datos, utilizaremos Supabase, que ofrece una solución PostgreSQL gestionada y fácil de integrar con Render.

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Obtén la URL de conexión PostgreSQL desde **Settings > Database**
3. Copia la URL en la variable `DATABASE_URL` de tu servicio Render
4. Las migraciones se ejecutan automáticamente en `build.sh`

```bash
python manage.py migrate  # Se ejecuta en el build
```

</details>

<details>
<summary><strong>Frontend en Cloudflare Pages</strong></summary>

#### Configuración del proyecto

| Propiedad        | Valor           |
| ---------------- | --------------- |
| Project root     | `frontend/`     |
| Build command    | `npm run build` |
| Output directory | `dist`          |

#### Variables de entorno

| Variable       | Valor                                  |
| -------------- | -------------------------------------- |
| `VITE_API_URL` | `https://tu-backend.onrender.com/api/` |

#### Soporte para rutas SPA

El archivo `frontend/public/_redirects` está configurado para redirigir todas las rutas a `index.html`, permitiendo que React Router maneje la navegación.

```bash
/* /index.html 200
```

</details>

## API Endpoints

| Método | Endpoint           | Descripción              |
| ------ | ------------------ | ------------------------ |
| POST   | `/api/users/`      | Registro de usuario      |
| POST   | `/api/auth/login/` | Login                    |
| GET    | `/api/users/me/`   | Datos del usuario actual |
| GET    | `/api/tasks/`      | Listar tareas            |
| POST   | `/api/tasks/`      | Crear tarea              |
| PUT    | `/api/tasks/{id}/` | Actualizar tarea         |
| DELETE | `/api/tasks/{id}/` | Eliminar tarea           |
