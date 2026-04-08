# ToDo List App

<!-- README improvements by @DMsuDev.... Ongoing -->

[Readme Español](https://github.com/RiverFlow96/FullStack-TodoList/blob/main/README.md)
 • [English Readme](https://github.com/RiverFlow96/FullStack-TodoList/blob/main/README.en.md)

A fullstack web application for task management with user authentication. Allows users to create, edit, complete, and delete personal tasks.

This project is part of my personal portfolio and is designed to demonstrate my skills in fullstack web development, including creating `REST APIs` with `Django` and developing user interfaces with `React`.

<p align="center">
  <img src="frontend/public/Screenshot.png" alt="App Screenshot" width="700">
</p>

## Features

- **Secure Authentication** User registration and login with JWT (access + refresh tokens)
- **Complete Task Management** Create, edit, complete and delete tasks in real-time `(CRUD)`
- **Task Status Control** Mark tasks as completed or pending
- **AI Assistant** AI-powered task suggestions (OpenRouter / LLM)
- **Protected Routes** Exclusive access for authenticated users
- **Robust Validation** Form validation with `Zod` schemas
- **Responsive Design** Adaptive interface with `Tailwind CSS` on all devices
- **Global State** Efficient state management with `Zustand`
- **API Documentation** Auto-generated Swagger UI and ReDoc with `drf-spectacular`

## Project Structure

```graph
FullStack-TodoList/
├── Makefile               # Task automation (make help)
├── backend/               # REST API with Django
│   ├── config/            # Main configuration
│   │   └── settings/      # Per-environment settings (development / production)
│   ├── apps/
│   │   ├── accounts/      # Authentication and users
│   │   ├── assistant/     # AI assistant
│   │   ├── core/          # Shared utilities
│   │   └── tasks/         # Tasks app (models, views, serializers)
│   └── scripts/           # Build and utility scripts
├── frontend/              # React app
│   └── src/
│       ├── api/           # HTTP client (Axios)
│       ├── components/    # Reusable components
│       ├── layouts/       # Page layouts
│       ├── pages/         # Main pages
│       ├── store/         # Zustand store
│       └── utils/         # Zod schemas
└── scripts/               # Environment setup scripts
```

## Technologies

### Frontend

![Frontend Stack](https://skillicons.dev/icons?i=react,vite,tailwind)

| Technology            | Purpose                   |
| --------------------- | ------------------------- |
| React 19              | User interface            |
| Vite                  | Build tool and dev server |
| Tailwind CSS 4        | Styling                   |
| Zustand               | Global state              |
| React Router 7        | Navigation                |
| React Hook Form + Zod | Form validation           |
| Axios                 | HTTP client               |

### Backend

![Backend Stack](https://skillicons.dev/icons?i=django,python,postgresql)

| Technology            | Purpose           |
| --------------------- | ----------------- |
| Django 6              | Backend framework |
| Django REST Framework | REST API          |
| SQLite / PostgreSQL   | Database          |

## Installation

### With Makefile (recommended)

```bash
make build-venv        # Create virtual environment and install dependencies
make migrate           # Apply migrations
make runserver         # Start backend at http://localhost:8000
make frontend-install  # Install frontend dependencies
make frontend-dev      # Start frontend at http://localhost:5173
```

> Run `make help` to see all available commands.

### Manual

<details>
<summary><strong>Backend</strong></summary>

<br>

1 - Navigate to directory and create/activate virtual environment

```bash
cd backend
python -m venv .venv

source .venv/bin/activate # Linux/macOS
.venv\Scripts\Activate.ps1 # Windows
```

2 - Install dependencies

```bash
pip install -e "../[dev]"
```

3 - Apply migrations

```bash
python manage.py migrate
```

4 - Start the server

```bash
python manage.py runserver
```

The server will be available at http://localhost:8000

</details>

<details>
<summary><strong>Frontend</strong></summary>

<br>

1 - Navigate to directory and install dependencies

```bash
cd frontend
npm install
```

2 - Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:5173

</details>

### Switching Django Environment

By default, `development` settings are used. To switch to production:

```bash
# Via Makefile
make runserver DJANGO_ENV=production

# Manual (Linux/macOS)
export DJANGO_SETTINGS_MODULE=config.settings.production

# Manual (Windows PowerShell)
$env:DJANGO_SETTINGS_MODULE = "config.settings.production"
```

## Production Deploy

<details>
<summary><strong>Backend on Render</strong></summary>

### Service Configuration

| Property      | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Root          | `backend/`                                                   |
| Build command | `./scripts/build_backend.sh`                                 |
| Start command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

### Environment Variables

| Variable                 | Value                                                     |
| ------------------------ | --------------------------------------------------------- |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production`                              |
| `SECRET_KEY`             | `your-very-long-secret-key`                               |
| `DEBUG`                  | `False`                                                   |
| `DATABASE_URL`           | `postgresql://user:password@db.supabase.co:5432/postgres` |
| `ALLOWED_HOSTS`          | `your-backend.onrender.com`                               |
| `CORS_ALLOWED_ORIGINS`   | `https://your-frontend.pages.dev`                         |
| `CSRF_TRUSTED_ORIGINS`   | `https://your-backend.onrender.com`                       |

> Tip: You can use `render.yaml` in the project root to automate the configuration

</details>

<details>
<summary><strong>Database on Supabase</strong></summary>

### Database Configuration

For the database, we'll use Supabase, which offers a managed PostgreSQL solution that's easy to integrate with Render.

1. Create a new project on [Supabase](https://supabase.com)
2. Get the PostgreSQL connection URL from **Settings > Database**
3. Copy the URL to the `DATABASE_URL` variable in your Render service
4. Migrations run automatically in `build.sh`

```bash
python manage.py migrate  # Runs during build
```

</details>

<details>
<summary><strong>Frontend on Cloudflare Pages</strong></summary>

#### Project Configuration

| Property         | Value           |
| ---------------- | --------------- |
| Project root     | `frontend/`     |
| Build command    | `npm run build` |
| Output directory | `dist`          |

#### Environment Variables

| Variable       | Value                                    |
| -------------- | ---------------------------------------- |
| `VITE_API_URL` | `https://your-backend.onrender.com/api/` |

#### SPA Routes Support

The `frontend/public/_redirects` file is configured to redirect all routes to `index.html`, allowing React Router to handle the navigation.

```bash
/* /index.html 200
```

</details>

## API Endpoints

> Interactive documentation available at `/api/docs/` (Swagger) and `/api/redoc/` (ReDoc)

| Method | Endpoint                | Description                  |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/api/users/`           | User registration            |
| GET    | `/api/users/me/`        | Get current user             |
| POST   | `/api/token/`           | Obtain JWT tokens (login)    |
| POST   | `/api/token/refresh/`   | Refresh access token         |
| GET    | `/api/tasks/`           | List tasks                   |
| POST   | `/api/tasks/`           | Create task                  |
| PUT    | `/api/tasks/{id}/`      | Update task                  |
| DELETE | `/api/tasks/{id}/`      | Delete task                  |
| POST   | `/api/ai/suggest-task/` | AI-powered task suggestion   |
| GET    | `/api/schema/`          | OpenAPI schema               |
| GET    | `/api/docs/`            | Swagger UI                   |
| GET    | `/api/redoc/`           | ReDoc                        |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

> In collaboration with [@DMsuDev](https://github.com/DMsuDev)
