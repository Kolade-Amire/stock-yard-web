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
  await page.goto("/ticker/PL");

  await expect(page.locator("body")).toContainText(/Connect the Stock Yard API|Research|Current price/);
  await expectNoHorizontalOverflow(page);

  const viewportWidth = page.viewportSize()?.width ?? 1280;

  if (viewportWidth < 1280 && !(await page.locator("body").textContent())?.includes("Connect the Stock Yard API")) {
    await page.getByRole("button", { name: /^chat$/i }).tap();
    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Chat" })).toBeVisible();

    const box = await dialog.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual((page.viewportSize()?.height ?? 0) + 1);
  }
});
