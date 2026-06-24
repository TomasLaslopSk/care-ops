import { test, expect } from "@playwright/test";
import { login, loginAsOperator } from "./helpers";

test.describe("auth", () => {
  test("operator can sign in to CareOps", async ({ page }) => {
    await loginAsOperator(page);
    // Sidebar shows the operator identity once signed in.
    await expect(page.getByText("operator", { exact: false })).toBeVisible();
  });

  test("a carer is rejected (operator-only)", async ({ page }) => {
    await login(page, "amara@care.test", "carer123");
    await expect(page.getByText("CareOps is for operators only")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveCount(0);
  });

  test("a relative is rejected (operator-only)", async ({ page }) => {
    await login(page, "relative@care.test", "relative123");
    await expect(page.getByText("CareOps is for operators only")).toBeVisible();
  });
});
