import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import user from '../test-data/user.json' assert { type: 'json' };
import { LoginPage } from '../pages/LoginPage.js';
import { MainPage } from '../pages/MainPage.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileWithColumnDropped = "messy_drop_foobar.csv";
const fileWithDuplicatesRemoved = "messy_removed_duplicates_name.csv";
const messyCSVPath = path.resolve(__dirname, '../test-data/messy.csv');
const filePathColumnsDropped = path.resolve(__dirname, `../downloads/${fileWithColumnDropped}`);
const filePathDuplicatesRemoved = path.resolve(__dirname, `../downloads/${fileWithDuplicatesRemoved}`);

test.beforeAll(() => {
  // delete any existing transformed output files from previous test runs
  if (fs.existsSync(filePathColumnsDropped)) {
    fs.unlinkSync(filePathColumnsDropped); 
  }
  if (fs.existsSync(filePathDuplicatesRemoved)) {
    fs.unlinkSync(filePathDuplicatesRemoved);
  }
});

test('Manual Transformation Flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const mainPage = new MainPage(page);
  const projectName = 'ManualTransFlow01';
  const columnToDrop = 'foobar';
  const columnToCheckForDuplicates = 'name';
  
  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  await mainPage.deleteAnyExistingProjects();
  await mainPage.createNewProject(projectName);
  await mainPage.waitForAndCloseToast('Project created successfully');

  await mainPage.addNodeDataInput(messyCSVPath);
  await mainPage.waitForAndCloseToast('Dataset(s) uploaded successfully.');
  await mainPage.waitForAndCloseToast('Pipeline execution completed successfully');
  await expect(page.getByTestId('node-input-selected')).toContainText('Data Input');
  await expect(page.getByTestId('node-input-selected')).toContainText('messy.csv');

  await mainPage.addNodeDropColumns(columnToDrop);
  await mainPage.waitForAndCloseToast('Pipeline execution completed successfully');
  await expect(page.locator('span.truncate').filter({ hasText: 'Drop Columns' })).toBeVisible();
  await mainPage.downloadResults(fileWithColumnDropped);
  expect(fs.existsSync(filePathColumnsDropped)).toBe(true);

  await mainPage.addNodeRemoveDuplicates(columnToCheckForDuplicates);
  await mainPage.waitForAndCloseToast('Pipeline execution completed successfully');
  await expect(page.locator('span.truncate').filter({ hasText: 'Remove Duplicates' })).toBeVisible();
  await mainPage.downloadResults(fileWithDuplicatesRemoved);
  expect(fs.existsSync(filePathDuplicatesRemoved)).toBe(true);  
});