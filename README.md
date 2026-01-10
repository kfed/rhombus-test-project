# Rhombus Test Project

This project contains automated Playwright tests for the Rhombus AI web application.

## Project Structure

```
rhombus-test-project/
├── api-tests/         # API tests
├── data-validation/   # Helper functions
├── downloads/         # Stores csv files downloaded during automated UI test execution
├── pages/             # Page Object Model files
├── test-data/         # Test data (e.g., user.json)
├── ui-tests/          # UI Test files
├── utils/             # Helper functions
├── .gitignore
├── package.lock.json
├── package.json
├── playwright.config.js
├── README.md
└── test-strategy.json
```

## Setup

1. **Install dependencies amd Playwright Chromium browser:**
   ```bash
   npm run setup
   ```

## Running Tests

- **Run UI tests in headless mode:**
  ```bash
  npm run test:ui
  ```

- **Run UI tests in headed mode:**
  ```bash
  npm run test:ui-headed
  ```

- **Run this test to get the login session token to be used for api testing**
  ```bash
  npm run test:get-session-token
  ```

- **Run API tests (make sure a valid unexpired session token exists in the test-data folder):**
  ```bash
  npm run test:api
  ```

- **Run Data Validation tests:**
  ```bash
  node datav-validation/validate-transformations.js
  ```

- **Run this to view a HTML report generated after a test run:**
  ```bash
  npm run report
  ```

## Test Data

- Credentials and csv files are stored in `test-data/user`.
- Downloaded csv files during UI test execution are stored in `downloads/`.

## Adding Tests

- Add new UI test files in the `ui-tests/` directory.
- Add new API test files in the `api-tests/` diretory.
- Add new data validation test files in the `data-validation/` diretory.
- Use the Page Object Model in `pages/` for maintainability of UI tests.

## Troubleshooting

- Ensure you have:
1. Cloned the project completely from https://github.com/kfed/rhombus-test-project.git
2. Run the setup command in step 1 above ("npm run setup"). Simply run it in your terminal in the parent directory of the cloned project.
3. To run a successful data validation script, downloaded test files must exist. These files are created by running a successful UI test automation run (i.e. npm run test)

---

**Author:** Kaan Duran