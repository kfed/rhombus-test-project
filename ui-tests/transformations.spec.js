const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const user = require('../test-data/user.json');
const { LoginPage } = require('../pages/LoginPage');
const { MainPage } = require('../pages/MainPage');


test.only('Manual Transformation Flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const mainPage = new MainPage(page);
  const projectName = 'ManualTransFlow01';
  const columnToDrop = 'foobar';
  const columnToCheckForDuplicates = 'name';
  const fileWithColumnDropped = "messy_drop_foobar.csv";
  const fileWithDuplicatesRemoved = "messy_removed_duplicates_name.csv";
  const messyCSVPath = path.resolve(__dirname, '../test-data/messy.csv');
  const filePathColumnsDropped = path.resolve(__dirname, `../downloads/${fileWithColumnDropped}`);
  const filePathDuplicatesRemoved = path.resolve(__dirname, `../downloads/${fileWithDuplicatesRemoved}`);
  
  // delete any existing transformed output files from previous test runs
  if (fs.existsSync(filePathColumnsDropped)) {
    fs.unlinkSync(filePathColumnsDropped); 
  }
  if (fs.existsSync(filePathDuplicatesRemoved)) {
    fs.unlinkSync(filePathDuplicatesRemoved);
  }

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