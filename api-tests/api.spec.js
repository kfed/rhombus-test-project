import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect, request } from '@playwright/test';
import { BASE_URL } from '../utils/config.js';
import { BASE_API_URL } from '../utils/config.js';
import { SESSION_COOKIE_PATH } from '../utils/config.js';
import { getAccessToken, createProject, uploadFile } from '../utils/api-helpers.js';
import { uniqueProjectName } from '../utils/utils.js';

const USERNAME = process.env.RHOMBUS_USERNAME;
const SESSION_COOKIE = fs.readFileSync(SESSION_COOKIE_PATH, 'utf-8').trim();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const validMessyCSVPath = path.resolve(__dirname, '../test-data/messy.csv');

test.describe('API Tests', () => {

  // UNAUTHORISED TESTS
  // API - Get Session Info Test (Unauthorised)
  test('should get public session info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/session`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  // API - Get User Profile Info Test (Unauthorised)
  test('should fail as unauthorised to get user profile info', async ({ request }) => {
    const response = await request.get(`${BASE_API_URL}/accounts/users/profile`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('detail', 'Unauthorized');
  });


  // AUTHORISED TESTS USING SESSION AND ACCESS TOKEN
  test.describe('API Tests', () => {
    if (!SESSION_COOKIE) {
      test.describe.skip('Session cookie file is not valid or does not exist. Run the UI test to generate it.');
    }

    // API - Get User Profile Info Test (Authorised)
    test('should get user profile info with session cookie', async ({ request }) => {
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

    // API - Get Session Info Test (Authorised)
    test('should get private session info which returns a valid access token', async ({ request }) => {
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

    // API - Get User Profile Info Test
    test('should return 200 as authorised to get user profile info', async ({ request }) => {
      const accessToken = await getAccessToken(request, BASE_URL, SESSION_COOKIE);const response = await request.get(`${BASE_API_URL}/accounts/users/profile`, {
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

    // API - Create Project and Upload File Test
    test('should create a new project via API and upload a valid file', async ({ request }) => {
      const projectName = uniqueProjectName('Test Project via API');
      const projectDescription = 'This is a test project created via API';
      const filename = "messy.csv";
      const description = 'This is a messy but valid CSV file';
      const filePath = validMessyCSVPath;
      const fileType = 'text/csv';
      const accessToken = await getAccessToken(request, BASE_URL, SESSION_COOKIE);

      const projectResponse = await createProject(request, BASE_API_URL, accessToken, projectName, projectDescription);
      expect(projectResponse.status()).toBe(201);
      const body = await projectResponse.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', projectName);
      expect(body).toHaveProperty('description', projectDescription);

      const projectId = body.id;
      const uploadResponse = await uploadFile(request, BASE_API_URL, accessToken, projectId, filePath, filename, description);
      expect(uploadResponse.status()).toBe(200);
      const uploadBody = await uploadResponse.json();
      expect(uploadBody).toHaveProperty('id');
      expect(uploadBody).toHaveProperty('title', filename);
      expect(uploadBody).toHaveProperty('description', description);
      expect(uploadBody).toHaveProperty('file', filename);
      expect(uploadBody).toHaveProperty('content_type', fileType);
    });

    // API - Attempt Duplicate Named Project Test (negative test)
    test('should create a new project and then be denied to create another duplicate project with the same name', async ({ request }) => {
      const projectDescription = 'This is a new project that will be attempted to create twice';
      const accessToken = await getAccessToken(request, BASE_URL, SESSION_COOKIE);
      const projectPayload = {
        name: uniqueProjectName('Test Project via API'),
        description: projectDescription,
        has_samples: false
      };
      const response = await createProject(request, BASE_API_URL, accessToken, projectPayload.name, projectPayload.description, projectPayload.has_samples);
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('name', projectPayload.name);
      expect(body).toHaveProperty('description', projectPayload.description);

      const duplicateResponse = await createProject(request, BASE_API_URL, accessToken, projectPayload.name, projectPayload.description, projectPayload.has_samples);
      expect(duplicateResponse.status()).toBe(409);
    });

    // API - Attempt to upload a file on a project belonging to another user (negative test)
    test('should attempt to upload a file to a project belonging to another user', async ({ request }) => {
      const invalidProjectId = '1382'; // belongs to another user
      const accessToken = await getAccessToken(request, BASE_URL, SESSION_COOKIE);
      const filePath = validMessyCSVPath;
      const filename = "messy.csv";
      const description = 'This is a messy but valid CSV file';
      const fileType = 'text/csv';

      const uploadResponse = await uploadFile(request, BASE_API_URL, accessToken, invalidProjectId, filePath, filename, description);
      expect(uploadResponse.status()).toBe(404);
    });
  });
});
