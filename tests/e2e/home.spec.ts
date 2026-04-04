import { expect, test } from "@playwright/test";

test("renders the discovery shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Market Intelligence")).toBeVisible();
  await expect(page.locator("header").getByRole("link", { name: "Discover" })).toBeVisible();
  await expect(page.locator("header").getByRole("link", { name: "Compare" })).toBeVisible();
});

test("desktop wordmark returns to home from compare", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium");

  await page.goto("/compare");
  await page.getByRole("link", { name: "Stock Yard" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Market Intelligence")).toBeVisible();
});

test("desktop theme toggle flips the runtime theme and stored preference", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium");

  await page.addInitScript(() => {
    window.localStorage.setItem("stock-yard:theme", "dark");
  });

  await page.goto("/compare");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("dark");

  await page.getByRole("button", { name: "Switch to light theme" }).click();

  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("light");
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("stock-yard:theme")))
    .toBe("light");
});
