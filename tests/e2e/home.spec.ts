import { expect, test } from "@playwright/test";

test("renders the discovery shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("A research terminal that feels quick, light, and deliberate.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Discover" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare" })).toBeVisible();
});
