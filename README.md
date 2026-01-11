# Rhombus Test Project

This project contains automated Playwright tests for the Rhombus AI web application.

# Walthrough Video Link
```
https://storage.googleapis.com/rhombus-ai-video/rhombus_video_waltkthrough.mov
```

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
├── .env               # Stores username and password values
├── .gitignore
├── ci-design.yml
├── package.lock.json
├── package.json
├── playwright.config.js
├── README.md
└── test-strategy.json
```

## Setup

1. **Install dependencies and Playwright Chromium browser:**

    ```bash
    npm run setup
    ```

2. **Setup .env variable:**

      Copy the example file and edit to fill in real credentials

        cp .env.example .env
    

3. **Prevent git tracking changes to the session token file:**

    ```bash
    git update-index --assume-unchanged test-data/session_cookie.txt
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

- **Run API tests (ensure a session token exists - if not, run the step above):**
  ```bash
  npm run test:api
  ```

- **Run Data Validation tests:**
  ```bash
  npm run test:data-validate
  ```

- **Run this to view a HTML report generated after a test run:**
  ```bash
  npm run report
  ```

## Test Data

- Credentials are sensitive for a live system, so manually enter these in the .env file
- Csv input files for tests are stored in `test-data/user`.
- Downloaded csv files during UI test execution are stored in `downloads/`.

## Environment Variables

This project uses environment variables for sensitive data (such as login credentials). Do not commit your real `.env` file to git. Instructions are in the setup section above.
**Never commit your real `.env` file. Only share `.env.example`!**

 Prevent git tracking changes to the session token file (run this once after cloning):
   ```bash
   git update-index --assume-unchanged test-data/session_cookie.txt
   ```

## What Was Tested/Not Tested
- UI Automation: I aimed to only the e2e test as was listed in the assessment for the manual transformation flow.
- Data Validation: I checked both generated output files from the UI test automation flow. I aimed to include scenarios that can each be failed based on different situations. The order was important, as the last test for each was the most comprehensive. It was designed that way so that if an earlier test failed, it would provide more information on the actual problem.
- API Tests: I covered two items from the list: **Authentication / Session Behaviour**, and **Dataset Upload**. I wasn't sure how much to include as part of Authentication, so i included the visible apis session and profile. For Dataset Upload, I included a specific test for it. It mentioned at least one negative test, so I included two... since the first one i did was the duplciate project name test and I wasn't sure if it fit the two items as it only worked with projects, so I added the second one for trying to upload a file to a different user's project.

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