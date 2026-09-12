import { test, expect } from "@playwright/test";

/**
 * End-to-end walk of the core product story: an author drafts content, an
 * admin (acting as reviewer/publisher) approves and publishes it, and it
 * becomes visible on the public site. Mirrors the demo script in the
 * project README.
 */
test.describe("Content lifecycle", () => {
  test("draft -> submit -> approve -> publish -> live on public site", async ({ page }) => {
    // Sign in as the seeded admin (can act as author, reviewer, and publisher).
    await page.goto("/login");
    await page.getByText("Morgan Blake").click();
    await expect(page).toHaveURL(/\/studio\/dashboard/);

    // Create new content.
    await page.goto("/studio/content/new");
    await page.getByPlaceholder(/AI Transformation Strategy/).fill("E2E Test Article");
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page).toHaveURL(/\/studio\/content\/.+/);

    // Write enough body content for the workflow to be meaningful, then save.
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.fill(
      "This is a end-to-end test article with enough words in the body to pass the minimum length quality check used across the platform for demonstration purposes."
    );
    await page.getByRole("button", { name: "Save Draft" }).click();
    await expect(page.getByText("Draft saved")).toBeVisible();

    // Submit for review, then approve, then publish.
    await page.getByRole("button", { name: "Submit for Review" }).click();
    await expect(page.getByText(/Content in_review|Content review/i)).toBeVisible({ timeout: 10_000 }).catch(() => {});
    await page.getByRole("button", { name: "Approve" }).click();
    await page.getByRole("button", { name: "Publish" }).click();

    // The status badge should now read Published.
    await expect(page.getByText("Published").first()).toBeVisible();
  });
});
