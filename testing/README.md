# Testing Folder Guide

This folder keeps quality checks for the portfolio site.

## What belongs here

- `checklists/`: Manual QA steps for pre-release checks.
- `fixtures/`: Reusable sample inputs for form and flow testing.
- `templates/playwright/`: Starter automated test templates for navigation, forms, and accessibility.

## Why this structure

- Keeps fast manual checks available even without a test runner.
- Separates stable sample data from test logic.
- Makes future automated testing easy to adopt without reorganizing files.

## Suggested workflow

1. Run the manual smoke checklist before each deploy.
2. Reuse fixture values when validating contact and service forms.
3. When ready for automation, copy template specs into a real test suite and install Playwright.

## Optional next automation step

If you want automated browser tests, install Playwright and move templates into a real suite:

- `npm init -y`
- `npm install -D @playwright/test`
- `npx playwright install`
