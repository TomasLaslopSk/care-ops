import { test, expect } from "@playwright/test";
import { loginAsOperator } from "./helpers";

test.describe("visits", () => {
  test("operator opens Visits, reassigns a carer, and opens a visit detail", async ({ page }) => {
    await loginAsOperator(page);
    await page.getByRole("link", { name: "Visits" }).click();

    await expect(page.getByRole("heading", { name: "Visits" })).toBeVisible();

    // First row's carer <select> — reassign to a different carer.
    const firstSelect = page.locator("table tbody tr").first().locator("select");
    await expect(firstSelect).toBeVisible();
    const options = firstSelect.locator("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
    const current = await firstSelect.inputValue();
    // Pick an option whose value differs from the current one.
    for (let i = 0; i < count; i++) {
      const val = await options.nth(i).getAttribute("value");
      if (val && val !== current) {
        await firstSelect.selectOption(val);
        await expect(firstSelect).toHaveValue(val);
        break;
      }
    }

    // Open the first visit's detail via its id link.
    const firstVisitLink = page.locator("table tbody tr").first().locator("a").first();
    await firstVisitLink.click();
    await expect(page.getByText("Tasks")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to visits/ })).toBeVisible();
  });
});
