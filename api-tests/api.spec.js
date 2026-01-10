import { test, expect, request } from '@playwright/test';
import { BASE_URL } from '../utils/config.js';
import { SESSION_COOKIE_PATH } from '../utils/config.js';
import fs from 'fs';

const SESSION_COOKIE = fs.readFileSync(SESSION_COOKIE_PATH, 'utf-8').trim();

test.describe('API Tests', () => {

  // Unauthorised access tests
  test('should get public session info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/session`);
    expect(response.status()).toBe(200);
  });

  test('should fail as unauthorised to get user profile info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/accounts/users/profile`, {
      headers: {
        Cookie: SESSION_COOKIE,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    expect(response.status()).toBe(401);
  });

  // Authorized access tests
  test('should get user profile info with session cookie', async ({ request }) => {
        if (!SESSION_COOKIE) {
      test.skip(true, 'Session cookie file is not valid or does not exist. Run the UI test to generate it.');
      return;
    }
    const response = await request.get(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: SESSION_COOKIE,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('email', 'rhomapp1@gmail.com');
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('expires');
  });


});



