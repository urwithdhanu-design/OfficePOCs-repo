import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/auth');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays role selection page', async ({ page }) => {
    await page.goto('/auth');
    
    await expect(page.getByText('Lloyds Banking Group')).toBeVisible();
    await expect(page.getByText('Product Setup Portal')).toBeVisible();
    await expect(page.getByText('Select a role to continue')).toBeVisible();
  });

  test('shows all three role options', async ({ page }) => {
    await page.goto('/auth');
    
    await expect(page.getByText('Admin')).toBeVisible();
    await expect(page.getByText('Business Manager')).toBeVisible();
    await expect(page.getByText('Business User')).toBeVisible();
  });

  test('login as Admin redirects to dashboard with approved submissions', async ({ page }) => {
    await page.goto('/auth');
    
    await page.getByText('View approved submissions and manage system approvals').click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Approved Submissions')).toBeVisible();
  });

  test('login as Business Manager redirects to dashboard with product submissions', async ({ page }) => {
    await page.goto('/auth');
    
    await page.getByText('Review and approve product submissions').click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Product Submissions')).toBeVisible();
  });

  test('login as Business User redirects to dashboard with product setup', async ({ page }) => {
    await page.goto('/auth');
    
    await page.getByText('Submit product configurations for approval').click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Product Setup')).toBeVisible();
  });

  test('logout returns to auth page', async ({ page }) => {
    await page.goto('/auth');
    
    // Login first
    await page.getByText('Submit product configurations for approval').click();
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    await expect(page).toHaveURL('/auth');
    await expect(page.getByText('Select a role to continue')).toBeVisible();
  });
});
