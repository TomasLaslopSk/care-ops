import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

// Regression guard for the "admin is a superset of operator" fix: admin must get
// the operator-style channel picker in Chat (previously admin saw an empty channel).
test.describe("admin chat", () => {
  test("admin gets the operator channel picker populated with carers", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Chat" }).click();
    await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();

    // Admin sees the operator view + a populated channel picker.
    await expect(page.getByText("Operator view — pick any carer's channel.")).toBeVisible();
    const picker = page.getByRole("combobox");
    await expect(picker).toBeVisible();
    // The first option is a real carer channel, not an empty placeholder.
    const firstOption = picker.locator("option").first();
    await expect(firstOption).toHaveText(/Carer ·/);
  });
});
