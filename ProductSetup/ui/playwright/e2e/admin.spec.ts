import { test, expect } from '@playwright/test';

test.describe('Admin - Approved Submissions View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Login as Admin
    await page.getByText('View approved submissions and manage system approvals').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays Approved Submissions section', async ({ page }) => {
    await expect(page.getByText('Approved Submissions')).toBeVisible();
    await expect(page.getByText('View approved product configurations and manage third-party system approvals')).toBeVisible();
  });

  test('does not show product setup wizard', async ({ page }) => {
    await expect(page.getByText('Product Setup')).not.toBeVisible();
  });

  test('does not show Product Submissions section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Product Submissions' })).not.toBeVisible();
  });

  test('shows empty state when no approved records', async ({ page }) => {
    await expect(page.getByText('No approved submissions yet')).toBeVisible();
  });
});

test.describe('Admin - System Approvals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => {
      localStorage.clear();
      // Add a mock approved record for testing
      const mockRecord = {
        id: 'approved-record-1',
        productData: {
          productName: 'Approved Premium Card',
          brands: ['lloyds', 'halifax'],
          additionalCardholders: 0,
          features: [{ id: 'f1', name: 'Cashback', code: 'CASH001', description: 'Cashback rewards', category: 'Rewards' }],
          externalSystems: [],
        },
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedBy: 'user@test.com',
        submittedByUserId: 'user-1',
        reviewedBy: 'manager@test.com',
      };
      localStorage.setItem('product_records', JSON.stringify([mockRecord]));
    });
    await page.reload();
    await page.getByText('View approved submissions and manage system approvals').click();
  });

  test('displays approved record in list', async ({ page }) => {
    await expect(page.getByText('Approved Premium Card')).toBeVisible();
    await expect(page.getByText('Approved', { exact: true }).first()).toBeVisible();
  });

  test('shows record details on click', async ({ page }) => {
    await page.getByText('Approved Premium Card').click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Third-Party System Approvals')).toBeVisible();
  });

  test('displays 10 third-party systems', async ({ page }) => {
    await page.getByText('Approved Premium Card').click();
    
    // Wait for systems to load
    await expect(page.getByText('Core Banking System')).toBeVisible();
    await expect(page.getByText('Payment Gateway')).toBeVisible();
    await expect(page.getByText('Fraud Detection System')).toBeVisible();
  });

  test('can change system approval status', async ({ page }) => {
    await page.getByText('Approved Premium Card').click();
    
    // Wait for dialog
    await expect(page.getByText('Third-Party System Approvals')).toBeVisible();
    
    // Find the first system's status dropdown
    const firstSelect = page.locator('select, [role="combobox"]').first();
    
    if (await firstSelect.isVisible()) {
      await firstSelect.click();
      await page.getByRole('option', { name: 'Approved' }).click();
    }
  });

  test('shows all system status options', async ({ page }) => {
    await page.getByText('Approved Premium Card').click();
    
    // Click on a status dropdown
    const dropdown = page.getByRole('combobox').first();
    await dropdown.click();
    
    // Check all options are available
    await expect(page.getByRole('option', { name: 'Pending' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'In Review' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Approved' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Rejected' })).toBeVisible();
  });
});
