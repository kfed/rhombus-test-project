import { test, expect, request } from '@playwright/test';
import { BASE_URL } from '../utils/config.js';
import { BASE_API_URL } from '../utils/config.js';
import { SESSION_COOKIE_PATH } from '../utils/config.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const USERNAME = process.env.RHOMBUS_USERNAME;
const SESSION_COOKIE = fs.readFileSync(SESSION_COOKIE_PATH, 'utf-8').trim();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const validMessyCSVPath = path.resolve(__dirname, '../test-data/messy.csv');
const corruptCSVPath = path.resolve(__dirname, '../test-data/corrupt.csv');

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

  test('should get private session info which returns a valid access token', async ({ request }) => {
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

  test('should return 200 as authorised to get user profile info', async ({ request }) => {
    if (!SESSION_COOKIE) {
      test.skip(true, 'Session cookie file is not valid or does not exist. Run the UI test to generate it.');
      return;
    }
    const { accessToken } = await (await request.get(`${BASE_URL}/api/auth/session`, { headers: { Cookie: SESSION_COOKIE } })).json();
    const response = await request.get(`${BASE_API_URL}/accounts/users/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('Response Status:', response.status());
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('first_name');
    expect(body).toHaveProperty('last_name');
  });

  test('should create a new project via API, a new input node and upload a valid file', async ({ request }) => {
    if (!SESSION_COOKIE) {
      test.skip(true, 'Session cookie file is not valid or does not exist. Run the UI test to generate it.');
      return;
    }
    const projectDescription = 'This is a test project created via API';
    const filename = "messy.csv";
    const description = 'This is a messy but valid CSV file';
    const filePath = validMessyCSVPath;
    const fileType = 'text/csv';
    const { accessToken } = await (await request.get(`${BASE_URL}/api/auth/session`, { headers: { Cookie: SESSION_COOKIE } })).json();
    const projectPayload = {
      name: `Test Project ${Date.now()}`,
      description: projectDescription,
      has_samples: false
    };
    const response = await request.post(`${BASE_API_URL}/dataset/projects/add`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      form: projectPayload
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name', projectPayload.name);
    expect(body).toHaveProperty('description', projectPayload.description);

    const projectId = body.id;
    const uploadResponse = await request.post(`${BASE_API_URL}/dataset/datasets/upload/${projectId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      multipart: {
        title: filename,
        file: fs.createReadStream(filePath),
        description: description,
        column_header_row: 1
      }
    });
    expect(uploadResponse.status()).toBe(200);
    const uploadBody = await uploadResponse.json();
    expect(uploadBody).toHaveProperty('id');
    expect(uploadBody).toHaveProperty('title', filename);
    expect(uploadBody).toHaveProperty('description', description);
    expect(uploadBody).toHaveProperty('file', filename);
    expect(uploadBody).toHaveProperty('content_type', fileType);
  });

});



