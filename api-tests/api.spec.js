import { test, expect, request } from '@playwright/test';
import { BASE_URL } from '../utils/config.js';
import { BASE_API_URL } from '../utils/config.js';
import { SESSION_COOKIE_PATH } from '../utils/config.js';

import 'dotenv/config';
import fs from 'fs';

const USERNAME = process.env.RHOMBUS_USERNAME;
const SESSION_COOKIE = fs.readFileSync(SESSION_COOKIE_PATH, 'utf-8').trim();

test.describe('API Tests', () => {

  // Unauthorised access tests
  test('should get public session info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/session`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  test('should fail as unauthorised to get user profile info', async ({ request }) => {
    const response = await request.get(`${BASE_API_URL}/accounts/users/profile`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('detail', 'Unauthorized');
  });

  // Authorized access tests
  test('should get user profile info with session cookie', async ({ request }) => {
    if (!SESSION_COOKIE) {
      test.skip(true, 'Session cookie file is not valid or does not exist. Run the UI test to generate it.');
      return;
    }
    const response = await request.get(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: SESSION_COOKIE
      }
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('email', USERNAME);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('expires');
  });

  test('should get private session info', async ({ request }) => {
    if (!SESSION_COOKIE) {
      test.skip(true, 'Session cookie file is not valid or does not exist. Run the UI test to generate it.');
      return;
    }
    const response = await request.get(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: SESSION_COOKIE
      }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('name', USERNAME);
    expect(body.user).toHaveProperty('email', USERNAME);
    expect(body.user).toHaveProperty('image');
    expect(body).toHaveProperty('expires');
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('isNewUser');
    expect(body).toHaveProperty('tutorialProjectId');
  });

});



