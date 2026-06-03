import { test, expect } from '@playwright/test';

test.describe('Business Manager - Submissions Review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Login as Business Manager
    await page.getByText('Review and approve product submissions').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays Product Submissions section', async ({ page }) => {
    await expect(page.getByText('Product Submissions')).toBeVisible();
    await expect(page.getByText('Review and approve product configurations submitted by business users')).toBeVisible();
  });

  test('does not show product setup wizard', async ({ page }) => {
    await expect(page.getByText('Product Setup')).not.toBeVisible();
  });

  test('displays submissions table or empty state', async ({ page }) => {
    // Either shows the table or "No submitted records found"
    const hasTable = await page.locator('table').count() > 0;
    const hasEmptyState = await page.getByText('No submitted records found').isVisible().catch(() => false);
    
    expect(hasTable || hasEmptyState).toBeTruthy();
  });
});

test.describe('Business Manager - Review Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => {
      localStorage.clear();
      // Add a mock pending record for testing
      const mockRecord = {
        id: 'test-record-1',
        productData: {
          productName: 'Test Pending Card',
          brands: ['lloyds'],
          additionalCardholders: 0,
          features: [],
          externalSystems: [],
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedBy: 'user@test.com',
        submittedByUserId: 'user-1',
      };
      localStorage.setItem('product_records', JSON.stringify([mockRecord]));
    });
    await page.reload();
    await page.getByText('Review and approve product submissions').click();
  });

  test('displays pending record in table', async ({ page }) => {
    await expect(page.getByText('Test Pending Card')).toBeVisible();
  });

  test('shows Pending Review badge for pending records', async ({ page }) => {
    await expect(page.getByText('Pending Review')).toBeVisible();
  });

  test('can open record details', async ({ page }) => {
    await page.getByText('Test Pending Card').click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Product Summary')).toBeVisible();
  });

  test('shows approve and reject buttons for pending records', async ({ page }) => {
    await page.getByText('Test Pending Card').click();
    
    await expect(page.getByRole('button', { name: /approve/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reject/i })).toBeVisible();
  });

  test('can approve a pending record', async ({ page }) => {
    await page.getByText('Test Pending Card').click();
    await page.getByRole('button', { name: /approve/i }).click();
    
    // Dialog should close and record should now show Approved
    await expect(page.getByText('Approved', { exact: true })).toBeVisible();
  });
});
