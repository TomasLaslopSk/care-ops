import { test, expect } from "@playwright/test";
import { loginAsOperator } from "./helpers";

test.describe("clients", () => {
  test("operator creates a client and it appears in the list", async ({ page }) => {
    await loginAsOperator(page);
    await page.getByRole("link", { name: "Clients" }).click();
    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();

    const unique = `Test Client ${Date.now()}`;
    await page.getByLabel("Client name").fill(unique);
    await page.getByLabel("Region").selectOption("South"); // only one Region select on this page
    await page.getByLabel("Address (optional)").fill("9 Test Street, London");
    await page.getByRole("button", { name: "Add client" }).click();

    await expect(page.getByText(`Client created: ${unique} (South)`)).toBeVisible();
    // The invalidated query refetches, so the new client shows in the table too.
    await expect(page.getByRole("cell", { name: unique })).toBeVisible();
  });
});
