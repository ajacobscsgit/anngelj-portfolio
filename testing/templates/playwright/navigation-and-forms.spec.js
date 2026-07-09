// Template only: copy into real Playwright test suite when automation is enabled.
// Requires: @playwright/test

import { test, expect } from "@playwright/test";

test("primary navigation opens key pages", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /services/i }).click();
  await expect(page).toHaveURL(/services\.html|\/services/);

  await page.getByRole("link", { name: /contact/i }).click();
  await expect(page).toHaveURL(/contact\.html|\/contact/);
});

test("contact form validates and submits", async ({ page }) => {
  await page.goto("/contact.html");

  await page.getByRole("button", { name: /submit|send/i }).click();
  await expect(page.locator("[required].field-error").first()).toBeVisible();

  await page.fill('input[name="name"]', "Jordan Rivera");
  await page.fill('input[name="email"]', "jordan.rivera@example.com");
  await page.fill('textarea[name="message"]', "Testing contact flow.");
  await page.getByRole("button", { name: /submit|send/i }).click();

  // Adjust expected result based on current form provider behavior.
  await expect(page).toHaveURL(/thank-you\.html|contact/);
});
