import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

// Seed a fresh proposed run via the ingest endpoint (same one the nightly runner uses).
async function seedRun(request: import("@playwright/test").APIRequestContext, task: string) {
  const res = await request.post("/api/agent-runs", {
    headers: { "x-agent-key": "dev-agent-key" },
    data: {
      agent: "e2eAgent",
      project: "care-ops-console",
      task,
      summary: `E2E seeded run: ${task}`,
      rationale: "Seeded by Playwright agent-runs.spec.ts",
      diff: "1 file changed",
      provenance: { skill: "e2e", scope: "care-ops-console", prompt: "agent-runs.spec.ts" },
    },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe("agent runs", () => {
  test("admin sees Agent runs and can approve and override", async ({ page, request }) => {
    const approveTask = `E2E approve ${Date.now()}`;
    const overrideTask = `E2E override ${Date.now()}`;
    await seedRun(request, approveTask);
    await seedRun(request, overrideTask);

    await loginAsAdmin(page);

    // Agent runs is admin-only — the nav link is present for admins.
    await page.getByRole("link", { name: "Agent runs" }).click();
    await expect(page.getByRole("heading", { name: "Agent runs" })).toBeVisible();

    // Approve the first seeded run.
    const approveCard = page.locator("div", { hasText: approveTask }).last();
    await approveCard.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText(`E2E seeded run: ${approveTask}`)).toBeVisible();

    // Override the second seeded run — requires a note.
    const overrideCard = page.locator("div", { hasText: overrideTask }).last();
    await overrideCard.getByPlaceholder(/Rationale/).fill("Overridden during e2e");
    await overrideCard.getByRole("button", { name: "Override" }).click();
    await expect(page.getByText("Overridden during e2e")).toBeVisible();
  });
});
