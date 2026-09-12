import { test, expect } from "@playwright/test";

test.describe("Public site", () => {
  test("home page renders and links to articles", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: "Browse Articles" }).click();
    await expect(page).toHaveURL(/\/articles$/);
  });

  test("published articles are visible and drafts are not", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByText("AI Transformation Strategy for Modern Enterprises")).toBeVisible();
    // "Building a Modern Data Platform" is seeded as a draft and must not
    // be discoverable on the public site.
    await expect(page.getByText("Building a Modern Data Platform")).toHaveCount(0);
  });

  test("an article detail page renders its content and metadata", async ({ page }) => {
    await page.goto("/articles/ai-transformation-strategy-for-modern-enterprises");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("AI Transformation Strategy");
    await expect(page).toHaveTitle(/AI Transformation Strategy/);
  });
});
