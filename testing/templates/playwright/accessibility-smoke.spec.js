// Template only: copy into real Playwright test suite when automation is enabled.
// Requires: @playwright/test and axe-core

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/", "/services.html", "/contact.html", "/request-service.html"];

for (const route of pages) {
  test(`a11y smoke: ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
