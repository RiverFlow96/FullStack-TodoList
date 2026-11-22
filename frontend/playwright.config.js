import { defineConfig, devices } from "@playwright/test"
import process from "node:process"
import { tmpdir } from "node:os"
import { join } from "node:path"

const databasePath = join(tmpdir(), `fullstack-todolist-e2e-${process.pid}.sqlite3`)

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
    outputDir: "test-results",
    use: {
        baseURL: "http://127.0.0.1:5173",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: [
        {
            command: "node e2e/start-backend.mjs",
            url: "http://127.0.0.1:8000/api/docs/",
            timeout: 120_000,
            reuseExistingServer: false,
        },
        {
            command: "bun run dev --host 127.0.0.1 --port 5173 --strictPort",
            url: "http://127.0.0.1:5173/auth/login",
            timeout: 120_000,
            reuseExistingServer: false,
            env: {
                VITE_API_URL: "http://127.0.0.1:8000/api/",
                E2E_DATABASE_PATH: databasePath,
            },
        },
    ],
})
