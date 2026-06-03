import { test, expect } from '@playwright/test';

test.describe('Complete User Journey - Business User to Approval', () => {
  test('full workflow: create product → submit → manager approves → admin manages systems', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    
    // === STEP 1: Business User creates and submits product ===
    await page.goto('/auth');
    await page.getByText('Submit product configurations for approval').click();
    
    // Fill Step 1 - Basic Info
    await page.getByPlaceholder(/enter product name/i).fill('E2E Test Card');
    await page.getByText('Lloyds').click();
    await page.getByText('Halifax').click();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 2 - Features (skip for now)
    await expect(page.getByText('Features')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 3 - System IDs (skip for now)
    await expect(page.getByText('External System IDs')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 4 - Review & Submit
    await expect(page.getByText('Review & Submit')).toBeVisible();
    await expect(page.getByText('E2E Test Card')).toBeVisible();
    
    // Submit the product
    await page.getByRole('button', { name: /submit for review/i }).click();
    
    // Check for success toast
    await expect(page.getByText('Product Submitted')).toBeVisible();
    
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // === STEP 2: Business Manager approves the product ===
    await page.getByText('Review and approve product submissions').click();
    
    // Find and click the submitted product
    await expect(page.getByText('E2E Test Card')).toBeVisible();
    await page.getByText('E2E Test Card').click();
    
    // Approve it
    await page.getByRole('button', { name: /approve/i }).click();
    
    // Verify approval
    await expect(page.getByText('Approved', { exact: true })).toBeVisible();
    
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // === STEP 3: Admin manages system approvals ===
    await page.getByText('View approved submissions and manage system approvals').click();
    
    // Find the approved product
    await expect(page.getByText('E2E Test Card')).toBeVisible();
    await page.getByText('E2E Test Card').click();
    
    // Verify system approvals dialog opens
    await expect(page.getByText('Third-Party System Approvals')).toBeVisible();
    await expect(page.getByText('Core Banking System')).toBeVisible();
    
    // Update a system status
    const dropdown = page.getByRole('combobox').first();
    await dropdown.click();
    await page.getByRole('option', { name: 'Approved' }).click();
    
    // Verify toast
    await expect(page.getByText('Status Updated')).toBeVisible();
  });
});

test.describe('Complete User Journey - Rejection Flow', () => {
  test('business manager rejects submission with notes', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    
    // Create a pending record first
    await page.evaluate(() => {
      const mockRecord = {
        id: 'rejection-test-record',
        productData: {
          productName: 'Incomplete Card',
          brands: [],
          additionalCardholders: 0,
          features: [],
          externalSystems: [],
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedBy: 'user@test.com',
      };
      localStorage.setItem('product_records', JSON.stringify([mockRecord]));
    });
    
    await page.goto('/auth');
    await page.getByText('Review and approve product submissions').click();
    
    // Open the record
    await page.getByText('Incomplete Card').click();
    
    // Add rejection notes
    const notesInput = page.getByPlaceholder(/add review notes/i);
    await notesInput.fill('Missing required brands. Please add at least one brand.');
    
    // Reject
    await page.getByRole('button', { name: /reject/i }).click();
    
    // Verify rejection
    await expect(page.getByText('Rejected', { exact: true })).toBeVisible();
  });
});

test.describe('Complete User Journey - Role Switching', () => {
  test('user can switch roles and see appropriate views', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/auth');
    
    // Login as Business User
    await page.getByText('Submit product configurations for approval').click();
    await expect(page.getByText('Product Setup')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Product Submissions' })).not.toBeVisible();
    
    // Switch to Business Manager
    await page.getByRole('button', { name: /logout/i }).click();
    await page.getByText('Review and approve product submissions').click();
    await expect(page.getByText('Product Submissions')).toBeVisible();
    await expect(page.getByText('Product Setup')).not.toBeVisible();
    
    // Switch to Admin
    await page.getByRole('button', { name: /logout/i }).click();
    await page.getByText('View approved submissions and manage system approvals').click();
    await expect(page.getByText('Approved Submissions')).toBeVisible();
    await expect(page.getByText('Product Setup')).not.toBeVisible();
  });
});
