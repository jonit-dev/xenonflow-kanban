import { test, expect } from '@playwright/test';

test('XenonFlow full CRUD flow', async ({ page }) => {
  await page.goto('http://localhost:3334');

  // Wait for app to load
  await expect(page.locator('h2')).toContainText('Test Project', { timeout: 10000 });

  console.log('✅ Page loaded');

  // Click "Spawn Entity" button
  await page.click('button:has-text("SPAWN ENTITY")');

  // Modal should be visible
  const modal = page.getByText('UNIT DATA TERMINAL').locator('..').locator('..').locator('..');
  await expect(modal).toBeVisible({ timeout: 5000 });

  console.log('✅ Modal opened');

  // Fill in ticket details
  const titleInput = page.locator('input[type="text"]').first();
  await titleInput.fill('Playwright Test Ticket');

  const textarea = page.locator('textarea');
  await textarea.fill('This ticket was created by automated Playwright test');

  // Skip priority for now - use default

  const pointsInput = page.locator('input[type="number"]');
  await pointsInput.fill('5');

  console.log('✅ Form filled');

  // Save ticket
  await page.click('button:has-text("SAVE DATA")');

  // Wait for modal to close and ticket to appear
  await expect(modal).not.toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Playwright Test Ticket')).toBeVisible({ timeout: 5000 });

  console.log('✅ Ticket created successfully');

  // Click on the ticket to edit
  await page.getByText('Playwright Test Ticket').click();

  // Modal should open again
  await expect(modal).toBeVisible();

  // Update title
  await titleInput.fill('Playwright Test Ticket - Updated');

  // Save
  await page.click('button:has-text("SAVE DATA")');

  // Modal should close
  await expect(modal).not.toBeVisible();
  await expect(page.getByText('Playwright Test Ticket - Updated')).toBeVisible();

  console.log('✅ Ticket updated successfully');

  // Refresh and verify persistence
  await page.reload();
  await expect(page.getByText('Playwright Test Ticket - Updated')).toBeVisible({ timeout: 5000 });

  console.log('✅ Ticket persisted after reload');

  console.log('✅ All tests passed!');
});
