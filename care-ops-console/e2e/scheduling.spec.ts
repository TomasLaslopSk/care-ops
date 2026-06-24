import { test, expect } from "@playwright/test";
import { loginAsOperator } from "./helpers";

test.describe("scheduling", () => {
  test("operator schedules a visit with tasks and it appears in Visits", async ({ page }) => {
    await loginAsOperator(page);
    await page.getByRole("link", { name: "Scheduling" }).click();
    await expect(page.getByRole("heading", { name: "Scheduling" })).toBeVisible();

    // Pick the first real client + carer (index 1 — index 0 is the "Select…" option).
    const clientSelect = page.getByLabel("Client");
    const carerSelect = page.getByLabel("Carer");
    await clientSelect.selectOption({ index: 1 });
    await carerSelect.selectOption({ index: 1 });

    // A near-future datetime for the datetime-local input.
    const dt = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    await page.getByLabel("When").fill(local);

    // Seed at least one task (the form pre-fills two, so this just confirms editing).
    const firstTask = page.getByPlaceholder("Task 1");
    await firstTask.fill("Medication");

    await page.getByRole("button", { name: "Schedule visit" }).click();

    // On success the form navigates to /visits.
    await expect(page).toHaveURL(/\/visits$/);
    await expect(page.getByRole("heading", { name: "Visits" })).toBeVisible();
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });
});
