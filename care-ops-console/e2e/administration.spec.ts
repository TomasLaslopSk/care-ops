import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("administration", () => {
  test("admin creates a new operator account", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Administration" }).click();
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();

    const stamp = Date.now();
    const name = `Test Operator ${stamp}`;
    const email = `op${stamp}@care.test`;

    await page.getByLabel("Full name").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Temporary password").fill("secret123");
    await page.getByLabel("Role").selectOption("operator");
    await page.getByRole("button", { name: "Create user" }).click();

    await expect(page.getByText(`User created: ${name} (operator)`)).toBeVisible();
    // Appears in the staff table after the list refetches.
    await expect(page.getByRole("cell", { name: email })).toBeVisible();
  });
});
