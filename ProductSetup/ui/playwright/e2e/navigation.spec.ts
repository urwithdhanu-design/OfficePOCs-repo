import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test('redirects to auth page when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth');
  });

  test('stays on dashboard when logged in', async ({ page }) => {
    await page.goto('/auth');
    await page.getByText('Submit product configurations for approval').click();
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh should keep on dashboard
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route');
    
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Oops! Page not found')).toBeVisible();
    await expect(page.getByText('Return to Home')).toBeVisible();
  });

  test('404 page has working home link', async ({ page }) => {
    await page.goto('/some-invalid-path');
    await page.getByText('Return to Home').click();
    
    await expect(page).toHaveURL('/');
  });
});

test.describe('Responsive Design', () => {
  test('auth page is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth');
    
    await expect(page.getByText('Lloyds Banking Group')).toBeVisible();
    await expect(page.getByText('Admin')).toBeVisible();
    await expect(page.getByText('Business Manager')).toBeVisible();
    await expect(page.getByText('Business User')).toBeVisible();
  });

  test('dashboard is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth');
    await page.getByText('Submit product configurations for approval').click();
    
    await expect(page.getByText('Lloyds')).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('auth page has accessible role buttons', async ({ page }) => {
    await page.goto('/auth');
    
    const adminButton = page.getByRole('button').filter({ hasText: 'Admin' });
    const managerButton = page.getByRole('button').filter({ hasText: 'Business Manager' });
    const userButton = page.getByRole('button').filter({ hasText: 'Business User' });
    
    await expect(adminButton).toBeVisible();
    await expect(managerButton).toBeVisible();
    await expect(userButton).toBeVisible();
  });

  test('dashboard has accessible navigation buttons', async ({ page }) => {
    await page.goto('/auth');
    await page.getByText('Submit product configurations for approval').click();
    
    const backButton = page.getByRole('button', { name: /back/i });
    const nextButton = page.getByRole('button', { name: /next/i });
    const logoutButton = page.getByRole('button', { name: /logout/i });
    
    await expect(backButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    await expect(logoutButton).toBeVisible();
  });

  test('form inputs have proper labels', async ({ page }) => {
    await page.goto('/auth');
    await page.getByText('Submit product configurations for approval').click();
    
    await expect(page.getByText('Product Name')).toBeVisible();
    await expect(page.getByText('Product Brands')).toBeVisible();
  });
});

test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('toast auto-dismisses after 3 seconds', async ({ page }) => {
    // Setup: Create an approved record and add system approvals
    await page.evaluate(() => {
      const mockRecord = {
        id: 'toast-test-record',
        productData: {
          productName: 'Toast Test Card',
          brands: ['lloyds'],
          additionalCardholders: 0,
          features: [],
          externalSystems: [],
        },
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedBy: 'user@test.com',
      };
      localStorage.setItem('product_records', JSON.stringify([mockRecord]));
    });
    
    // Login as admin
    await page.getByText('View approved submissions and manage system approvals').click();
    
    // Click on the record to open system approvals
    await page.getByText('Toast Test Card').click();
    
    // Wait for dialog and change a status
    await page.waitForSelector('[role="dialog"]');
    
    const dropdown = page.getByRole('combobox').first();
    if (await dropdown.isVisible()) {
      await dropdown.click();
      await page.getByRole('option', { name: 'Approved' }).click();
      
      // Toast should appear
      await expect(page.getByText('Status Updated')).toBeVisible();
      
      // Toast should disappear after ~3 seconds
      await expect(page.getByText('Status Updated')).not.toBeVisible({ timeout: 5000 });
    }
  });
});
