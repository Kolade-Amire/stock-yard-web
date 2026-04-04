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

test("iphone xr dark theme keeps hero search shell readable", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "webkit" || testInfo.project.name !== "webkit-iphone-xr");

  await page.addInitScript(() => {
    window.localStorage.setItem("stock-yard:theme", "dark");
  });

  await page.goto("/");
  await expect(page.getByText("Market Intelligence")).toBeVisible();

  const heroSearchShell = page.locator("main form.glass-shell.glass-input-shell").first();
  const heroSearchInput = heroSearchShell.getByRole("combobox");

  await expect(heroSearchShell).toBeVisible();
  await expect(heroSearchInput).toBeVisible();

  const shellStyles = await page.evaluate(() => {
    const shell = document.querySelector("main form.glass-shell.glass-input-shell");
    const input = shell?.querySelector("input");

    if (!(shell instanceof HTMLElement) || !(input instanceof HTMLInputElement)) {
      return null;
    }

    const shellStyles = getComputedStyle(shell);
    const inputStyles = getComputedStyle(input);
    const backdropFilter = shellStyles.backdropFilter.trim();
    const webkitBackdropFilter = shellStyles.getPropertyValue("-webkit-backdrop-filter").trim();

    return {
      backdropFilter,
      webkitBackdropFilter,
      filterDisabled: backdropFilter === "none" || webkitBackdropFilter === "none",
      base: shellStyles.getPropertyValue("--glass-input-shell-base").trim(),
      textColor: inputStyles.color,
      placeholderColor: inputStyles.getPropertyValue("color").trim(),
    };
  });

  expect(shellStyles).not.toBeNull();
  expect(shellStyles?.filterDisabled).toBe(true);
  expect(shellStyles?.base).toMatch(/^(rgba\(20, 24, 33, 0\.94\)|#141821f0)$/);
  expect(shellStyles?.textColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(shellStyles?.placeholderColor).not.toBe("rgba(0, 0, 0, 0)");
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

test("iphone xr dark theme keeps ticker glass surfaces readable", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "webkit" || testInfo.project.name !== "webkit-iphone-xr");

  await page.addInitScript(() => {
    window.localStorage.setItem("stock-yard:theme", "dark");
  });

  await page.goto("/ticker/AAPL");
  await expect(page.locator("body")).toContainText(/Research|Current price/);

  const microPill = page.locator(".glass-micro-pill").first();
  const subcard = page.locator(".glass-subcard").first();

  await expect(microPill).toBeVisible();
  await expect(subcard).toBeVisible();

  const surfaceStyles = await page.evaluate(() => {
    function readSurface(selector: string) {
      const element = document.querySelector(selector);

      if (!(element instanceof HTMLElement)) {
        return null;
      }

      const styles = getComputedStyle(element);
      const backdropFilter = styles.backdropFilter.trim();
      const webkitBackdropFilter = styles.getPropertyValue("-webkit-backdrop-filter").trim();

      return {
        backdropFilter,
        webkitBackdropFilter,
        filterDisabled: backdropFilter === "none" || webkitBackdropFilter === "none",
        base: styles.getPropertyValue("--glass-subsurface-base").trim(),
        textColor: styles.color,
        textLength: (element.textContent ?? "").trim().length,
      };
    }

    return {
      microPill: readSurface(".glass-micro-pill"),
      subcard: readSurface(".glass-subcard"),
    };
  });

  expect(surfaceStyles.microPill?.filterDisabled).toBe(true);
  expect(surfaceStyles.subcard?.filterDisabled).toBe(true);
  expect(surfaceStyles.microPill?.base).toMatch(/^(rgba\(20, 24, 33, 0\.94\)|#141821f0)$/);
  expect(surfaceStyles.subcard?.base).toMatch(/^(rgba\(20, 24, 33, 0\.94\)|#141821f0)$/);
  expect(surfaceStyles.microPill?.textLength ?? 0).toBeGreaterThan(0);
  expect(surfaceStyles.subcard?.textLength ?? 0).toBeGreaterThan(0);
  expect(surfaceStyles.microPill?.textColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(surfaceStyles.subcard?.textColor).not.toBe("rgba(0, 0, 0, 0)");
});
