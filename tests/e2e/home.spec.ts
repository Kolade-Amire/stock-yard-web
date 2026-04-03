import { expect, test } from "@playwright/test";

test("renders the discovery shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Market Intelligence")).toBeVisible();
  await expect(page.locator("header").getByRole("link", { name: "Discover" })).toBeVisible();
  await expect(page.locator("header").getByRole("link", { name: "Compare" })).toBeVisible();
});
