import { test, expect } from "@playwright/test";
import { loginAsOperator } from "./helpers";

test.describe("carers", () => {
  test("operator creates a carer and sees the success toast", async ({ page }) => {
    await loginAsOperator(page);
    await page.getByRole("link", { name: "Carers" }).click();
    await expect(page.getByRole("heading", { name: "Carers" })).toBeVisible();

    const unique = `Test Carer ${Date.now()}`;
    await page.getByLabel("Carer name").fill(unique);
    // The create form's Region select is the first one (Filters renders a second).
    await page.getByLabel("Region").first().selectOption("North");
    await page.getByRole("button", { name: "Add carer" }).click();

    await expect(page.getByText(`Carer created: ${unique} (North)`)).toBeVisible();
  });
});
