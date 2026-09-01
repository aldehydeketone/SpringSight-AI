import { test, expect } from '@playwright/test';

test.describe('SpringSight AI - Comprehensive E2E Tests', () => {

  test('1. Authentication Flow', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Verify page title and header
    await expect(page).toHaveTitle(/SpringSight AI/);
    await expect(page.locator('text=Sign in to your SpringSight AI dashboard')).toBeVisible();
    
    // Check form fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Test navigation links
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    await expect(page.locator('a[href="/signup"]')).toBeVisible();
  });

  test('2. Dashboard Layout & Diagnostics', async ({ page }) => {
    // Authenticate with session
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.sig');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Mihir Singh', email: 'admin@springsight.ai' }));
    });
    await page.goto('http://localhost:3000/dashboard');

    // Header & Sidebar verification
    await expect(page.locator('text=Log Observability & Diagnostics')).toBeVisible();
    await expect(page.locator('text=Diagnostics Online')).toBeVisible();
    await expect(page.locator('aside').getByText('AI Log Analysis')).toBeVisible();
    await expect(page.locator('aside').getByText('Upload Logs')).toBeVisible();
    await expect(page.locator('aside').getByText('Analysis History')).toBeVisible();
    await expect(page.locator('aside').getByText('Settings')).toBeVisible();

    // Upload Workspace & Telemetry Stream
    await expect(page.getByText('Upload Workspace', { exact: true })).toBeVisible();
    await expect(page.locator('text=Drop log files here')).toBeVisible();
    await expect(page.locator('text=Live Ingestion Telemetry')).toBeVisible();

    // KPI Cards
    await expect(page.locator('text=Total Ingested Reports')).toBeVisible();
    await expect(page.locator('text=Critical Incidents')).toBeVisible();
    await expect(page.locator('text=High Severity Errors')).toBeVisible();
    await expect(page.locator('text=RCA Diagnostic Rate')).toBeVisible();
  });

  test('3. Upload Workspace Page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.sig');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Mihir Singh', email: 'admin@springsight.ai' }));
    });
    await page.goto('http://localhost:3000/upload');

    // Verify Ingestion pipeline
    await expect(page.locator('text=Log Ingestion Pipeline')).toBeVisible();
    await expect(page.locator('text=Live Ingestion Engine')).toBeVisible();
    await expect(page.locator('text=Choose file')).toBeVisible();
  });

  test('4. Reports & Incident RCA Page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.sig');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Mihir Singh', email: 'admin@springsight.ai' }));
    });
    await page.goto('http://localhost:3000/reports');

    // Verify search and filters
    await expect(page.locator('input[placeholder*="Search reports"]')).toBeVisible();
    await expect(page.locator('button:has-text("ALL")')).toBeVisible();
    await expect(page.locator('button:has-text("CRITICAL")')).toBeVisible();
  });

  test('5. Settings Page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.sig');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Mihir Singh', email: 'admin@springsight.ai' }));
    });
    await page.goto('http://localhost:3000/settings');

    // Verify user profile and AI engine settings
    await expect(page.locator('text=System & Account Settings')).toBeVisible();
    await expect(page.locator('main').locator('h3:has-text("Mihir Singh")')).toBeVisible();
    await expect(page.locator('text=AI Diagnostic Engine')).toBeVisible();
    await expect(page.locator('text=CLI Ingestion Token')).toBeVisible();
    await expect(page.locator('text=Sign Out of Session')).toBeVisible();
  });

});
