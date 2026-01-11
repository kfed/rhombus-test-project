import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { SESSION_COOKIE_PATH } from '../utils/config.js';
import fs from 'fs';

test.only('UI login and capture session token', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginAndGotoMain();

  const cookies = await context.cookies();
  const sessionCookie = cookies.find(c => c.name === '__Secure-authjs.session-token');
  expect(sessionCookie).toBeDefined();

  const cookieString = `__Secure-authjs.session-token=${sessionCookie.value}`;
  fs.writeFileSync(SESSION_COOKIE_PATH, cookieString);
});