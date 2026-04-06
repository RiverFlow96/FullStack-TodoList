# ToDo List App

<!-- README improvements by @DMsuDev.... Ongoing -->

[Readme Español](https://github.com/RiverFlow96/FullStack-TodoList/blob/main/README.md)
 • [English Readme](https://github.com/RiverFlow96/FullStack-TodoList/blob/main/README.en.md)

A fullstack web application for task management with user authentication. Allows users to create, edit, complete, and delete personal tasks.

This project is part of my personal portfolio and is designed to demonstrate my skills in fullstack web development, including creating `REST APIs` with `Django` and developing user interfaces with `React`.

![App Screenshot](frontend/public/Screenshot.png)

## Features

- **Secure Authentication** User registration and login
- **Complete Task Management** Create, edit, complete and delete tasks in real-time `(CRUD)`
- **Task Status Control** Mark tasks as completed or pending
- **Protected Routes** Exclusive access for authenticated users
- **Robust Validation** Form validation with `Zod` schemas
- **Responsive Design** Adaptive interface with `Tailwind CSS` on all devices
- **Global State** Efficient state management with `Zustand`

## Project Structure

```graph
FullStack/
├── backend/           # REST API with Django
│   ├── todolistapi/   # Main configuration
│   └── tasks/         # Tasks app (models, views, serializers)
└── frontend/          # React app
    └── src/
        ├── components/    # Reusable components
        ├── layouts/       # Page layouts
        ├── pages/         # Main pages
        ├── store/         # Zustand store
        └── utils/         # Zod schemas
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

<br>

> **Development Note:** A `Makefile` is included to simplify common tasks. Run `make help` to see all available commands (create environment, run server, lint, tests, etc.).

## Production Deploy

<details>
<summary><strong>Backend on Render</strong></summary>

### Service Configuration

| Property      | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Root          | `backend/`                                                   |
| Build command | `./scripts/build_backend.sh`                                 |
| Start command | `gunicorn todolistapi.wsgi:application --bind 0.0.0.0:$PORT` |

### Environment Variables

| Variable               | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| `SECRET_KEY`           | `your-very-long-secret-key`                               |
| `DEBUG`                | `False`                                                   |
| `DATABASE_URL`         | `postgresql://user:password@db.supabase.co:5432/postgres` |
| `ALLOWED_HOSTS`        | `your-backend.onrender.com`                               |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.pages.dev`                         |
| `CSRF_TRUSTED_ORIGINS` | `https://your-backend.onrender.com`                       |

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

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/api/users/`      | User registration |
| POST   | `/api/auth/login/` | Login             |
| GET    | `/api/users/me/`   | Get current user  |
| GET    | `/api/tasks/`      | List tasks        |
| POST   | `/api/tasks/`      | Create task       |
| PUT    | `/api/tasks/{id}/` | Update task       |
| DELETE | `/api/tasks/{id}/` | Delete task       |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

> In collaboration with [@DMsuDev](https://github.com/DMsuDev)
