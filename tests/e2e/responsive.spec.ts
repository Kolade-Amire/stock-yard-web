import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test("home layout stays inside the viewport", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Market Intelligence")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const viewportWidth = page.viewportSize()?.width ?? 1280;

  if (viewportWidth < 768) {
    await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
  }
});

test("compare layout stays inside the viewport", async ({ page }) => {
  await page.goto("/compare");

  await expect(page.getByRole("heading", { name: "Compare" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Compare symbol search" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("ticker route shell stays inside the viewport", async ({ page }) => {
  await page.goto("/ticker/AAPL");

  await expect(page.locator("body")).toContainText(/Connect the Stock Yard API|Research|Current price/);
  await expectNoHorizontalOverflow(page);
});
