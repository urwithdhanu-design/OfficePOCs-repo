import { test, expect } from '@playwright/test';

test.describe('Business User - Product Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Login as Business User
    await page.getByText('Submit product configurations for approval').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays product setup wizard on step 1', async ({ page }) => {
    await expect(page.getByText('Product Setup')).toBeVisible();
    await expect(page.getByText('Configure your credit card products')).toBeVisible();
    await expect(page.getByPlaceholder(/enter product name/i)).toBeVisible();
  });

  test('shows brand selection options', async ({ page }) => {
    await expect(page.getByText('Lloyds')).toBeVisible();
    await expect(page.getByText('Halifax')).toBeVisible();
    await expect(page.getByText('Bank of Scotland')).toBeVisible();
    await expect(page.getByText('MBNA')).toBeVisible();
  });

  test('back button is disabled on first step', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeDisabled();
  });

  test('next button is disabled without filling required fields', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeDisabled();
  });

  test('can fill product name and select brand', async ({ page }) => {
    // Fill product name
    await page.getByPlaceholder(/enter product name/i).fill('Premium Rewards Card');
    
    // Select a brand
    await page.getByText('Lloyds').click();
    
    // Next button should be enabled
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeEnabled();
  });

  test('navigates through all steps', async ({ page }) => {
    // Step 1: Fill basic info
    await page.getByPlaceholder(/enter product name/i).fill('Test Card');
    await page.getByText('Lloyds').click();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 2: Features
    await expect(page.getByText('Features')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 3: System IDs
    await expect(page.getByText('External System IDs')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Step 4: Review
    await expect(page.getByText('Review & Submit')).toBeVisible();
  });

  test('can navigate back through steps', async ({ page }) => {
    // Fill and go to step 2
    await page.getByPlaceholder(/enter product name/i).fill('Test Card');
    await page.getByText('Lloyds').click();
    await page.getByRole('button', { name: /next/i }).click();
    
    await expect(page.getByText('Features')).toBeVisible();
    
    // Go back to step 1
    await page.getByRole('button', { name: /back/i }).click();
    
    await expect(page.getByPlaceholder(/enter product name/i)).toBeVisible();
  });

  test('shows My Submissions button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /my submissions/i })).toBeVisible();
  });

  test('opens My Submissions dialog', async ({ page }) => {
    await page.getByRole('button', { name: /my submissions/i }).click();
    
    await expect(page.getByText('Track the status of your submitted product configurations')).toBeVisible();
  });
});

test.describe('Business User - Card Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByText('Submit product configurations for approval').click();
  });

  test('displays card preview section', async ({ page }) => {
    await expect(page.getByText('Card Preview')).toBeVisible();
  });

  test('card preview updates with product name', async ({ page }) => {
    await page.getByPlaceholder(/enter product name/i).fill('My Custom Card');
    
    // The card preview should show the product name
    await expect(page.locator('.bg-gradient-to-br').getByText('My Custom Card')).toBeVisible();
  });
});
