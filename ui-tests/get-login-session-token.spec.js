import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { SESSION_COOKIE_PATH } from '../utils/config.js';
import { USER_DATA_PATH } from '../utils/config.js';
import fs from 'fs';
import path from 'path';

const user = JSON.parse(fs.readFileSync(USER_DATA_PATH, 'utf-8'));

test.only('UI login and capture session token', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  await expect(page).toHaveURL(/redirect/);
  await expect(page.locator('span:has-text("Dashboard")')).toBeVisible();

  const cookies = await context.cookies();
  const sessionCookie = cookies.find(c => c.name === '__Secure-authjs.session-token');
  expect(sessionCookie).toBeDefined();

  const cookieString = `__Secure-authjs.session-token=${sessionCookie.value}`;
  fs.writeFileSync(SESSION_COOKIE_PATH, cookieString);
});