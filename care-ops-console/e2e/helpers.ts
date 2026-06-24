import { type Page, expect } from "@playwright/test";

// Sign in through the real login form (app="ops" is sent by the console).
export async function login(page: Page, email: string, password: string) {
  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

// Sign in as the operator and wait for the app shell (Dashboard) to render.
export async function loginAsOperator(page: Page) {
  await login(page, "operator@care.test", "operator123");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

// Sign in as the admin (admin can also access CareOps + the Agent runs page).
export async function loginAsAdmin(page: Page) {
  await login(page, "admin@care.test", "admin123");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}
