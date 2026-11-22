import { randomUUID } from "node:crypto"
import { expect, test } from "@playwright/test"

const password = "Password123!"

async function registerAndLogin(page) {
    const username = `e2e${randomUUID().replaceAll("-", "").slice(0, 12)}`

    await page.goto("/auth/register")
    await page.getByPlaceholder("username").fill(username)
    await page.getByPlaceholder("password", { exact: true }).fill(password)
    await page.getByPlaceholder("confirm password").fill(password)
    await page.getByPlaceholder("example@email.com").fill(`${username}@example.test`)
    await page.getByRole("button", { name: "Register" }).click()
    await expect(page).toHaveURL(/\/auth\/login$/)

    await page.getByPlaceholder("username").fill(username)
    await page.getByPlaceholder("password").fill(password)
    await page.getByRole("button", { name: "Login" }).click()
    await expect(page).toHaveURL(/\/home$/)

    return username
}

test("protected routes redirect to login when signed out", async ({ page }) => {
    await page.goto("/home/add")

    await expect(page).toHaveURL(/\/auth\/login$/)
    await expect(page.getByRole("heading", { name: "LOGIN" })).toBeVisible()
})

test("registers, logs in, manages a group and task, then logs out", async ({ page }) => {
    await registerAndLogin(page)

    await page.getByRole("button", { name: "NuevoGrupo" }).click()
    const groupName = page.getByPlaceholder("Nombre")
    await groupName.fill("E2E Work")
    await groupName.press("Enter")
    await expect(page.getByRole("button", { name: /E2E Work/ })).toBeVisible()
    await page.getByRole("button", { name: /E2E Work/ }).click()
    await expect(page.getByText("No tasks found")).toBeVisible()

    await page.getByRole("button", { name: "Show tasks in E2E Work" }).hover()
    await page.getByRole("button", { name: "Edit group E2E Work" }).click()
    await page.getByRole("textbox", { name: "Group name" }).fill("E2E Projects")
    await page.getByRole("button", { name: "Save group changes" }).click()
    await expect(page.getByRole("button", { name: "Show tasks in E2E Projects" })).toBeVisible()
    await page.getByRole("button", { name: "Show tasks in E2E Projects" }).click()

    await page.getByRole("button", { name: "Add task" }).click()
    await page.getByPlaceholder("Enter task title").fill("E2E task")
    await page.getByPlaceholder("Enter task description (optional)").fill("Created by Playwright")
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("E2E task", { exact: true })).toBeVisible()

    const taskSearch = page.getByPlaceholder("Search tasks...").first()
    await taskSearch.fill("does not exist")
    await expect(page.getByText("No tasks found")).toBeVisible()
    await taskSearch.fill("E2E task")
    await expect(page.getByText("E2E task", { exact: true })).toBeVisible()
    const taskStatusFilter = page.getByRole("combobox").nth(1)
    await taskStatusFilter.selectOption("completed")
    await expect(page.getByText("No tasks found")).toBeVisible()
    await taskStatusFilter.selectOption("uncompleted")
    await expect(page.getByText("E2E task", { exact: true })).toBeVisible()
    await taskSearch.fill("")

    await page.getByText("E2E task", { exact: true }).click()
    await expect(page.getByRole("heading", { name: "Edit Task" })).toBeVisible()
    await page.getByPlaceholder("Enter task title").fill("Edited E2E task")
    await page.getByPlaceholder("Enter task description (optional)").fill("Updated by Playwright")
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Edited E2E task", { exact: true })).toBeVisible()

    page.once("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: "Delete task" }).click()
    await expect(page.getByText("Edited E2E task", { exact: true })).toHaveCount(0)

    await page.getByRole("button", { name: "Show tasks in E2E Projects" }).hover()
    page.once("dialog", (dialog) => dialog.accept())
    await page.getByRole("button", { name: "Delete group E2E Projects" }).click()
    await expect(page.getByRole("button", { name: "Show tasks in E2E Projects" })).toHaveCount(0)

    await page.getByRole("button", { name: "Log out" }).click()
    await expect(page).toHaveURL(/\/auth\/login$/)
    await page.goto("/profile")
    await expect(page).toHaveURL(/\/auth\/login$/)
})

test("shows a visible error when the tasks API fails", async ({ page }) => {
    await registerAndLogin(page)
    await page.route("**/api/tasks/", async (route) => {
        if (route.request().method() === "GET") {
            await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ detail: "Service unavailable" }) })
        } else {
            await route.continue()
        }
    })

    await page.reload()

    await expect(page.getByText(/Error: Request failed with status code 503/)).toBeVisible()
})
