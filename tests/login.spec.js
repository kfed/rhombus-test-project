const { test, expect } = require('@playwright/test');
const user = require('../fixtures/user.json');
const { LoginPage } = require('../pages/LoginPage');

test('Login workflow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text=Welcome')).toBeVisible();
});