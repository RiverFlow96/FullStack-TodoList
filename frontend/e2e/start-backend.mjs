import { spawn, spawnSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"
import process from "node:process"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, "../..")
const backendDirectory = join(projectRoot, "backend")
const virtualEnvPython = process.platform === "win32"
    ? join(projectRoot, ".venv", "Scripts", "python.exe")
    : join(projectRoot, ".venv", "bin", "python")
const python = process.env.PYTHON || (existsSync(virtualEnvPython) ? virtualEnvPython : "python3")
const databasePath = join(tmpdir(), `fullstack-todolist-e2e-${process.pid}.sqlite3`)
const environment = {
    ...process.env,
    DJANGO_SETTINGS_MODULE: "config.settings.e2e",
    E2E_DATABASE_PATH: databasePath,
}

rmSync(databasePath, { force: true })

const migration = spawnSync(python, ["manage.py", "migrate", "--noinput"], {
    cwd: backendDirectory,
    env: environment,
    stdio: "inherit",
})

if (migration.error) throw migration.error
if (migration.status !== 0) process.exit(migration.status ?? 1)

const server = spawn(python, ["manage.py", "runserver", "127.0.0.1:8000", "--noreload"], {
    cwd: backendDirectory,
    env: environment,
    stdio: "inherit",
})

const shutdown = () => server.kill("SIGTERM")
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
process.on("exit", () => {
    rmSync(databasePath, { force: true })
    rmSync(`${databasePath}-journal`, { force: true })
})

server.on("error", (error) => {
    console.error("Could not start the E2E Django server:", error)
    process.exitCode = 1
})
server.on("exit", (code) => {
    process.exitCode = code ?? 0
})
