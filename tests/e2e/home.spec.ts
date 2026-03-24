import { expect, test } from "@playwright/test";

test("renders the discovery shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Market Intelligence")).toBeVisible();
  await expect(page.getByRole("link", { name: "Discover" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare" })).toBeVisible();
});
