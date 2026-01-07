# Rhombus Test Project

This project contains automated Playwright tests for the Rhombus AI web application.

## Project Structure

```
rhombus-test-project/
├── ui-tests/      # UI Test files
├── pages/         # Page Object Model files
├── fixtures/      # Test data (e.g., user.json)
├── utils/         # Helper functions
├── playwright.config.js
├── package.json
└── README.md
```

## Setup

1. **Install dependencies amd Playwright Chromium browser:**
   ```bash
   npm run setup
   ```

## Running Tests

- **Run all tests:**
  ```bash
  npm run test
  ```

- **Run tests in headed mode:**
  ```bash
  npm run test:headed
  ```

- **View HTML report:**
  ```bash
  npm run report
  ```

## Test Data

- Credentials and csv files are stored in `fixtures/user.json`.

## Adding Tests

- Add new UI test files in the `ui-tests/` directory.
- Add new API test files in the 'api-tests/' diretory.
- Add new data validation test files in the 'data-validation/' diretory.
- Use the Page Object Model in `pages/` for maintainability of UI tests.


## Troubleshooting

- Ensure you have:
1. Cloned the project completely from https://github.com/kfed/rhombus-test-project.git
2. Run the setup command in step 1 above ("npm run setup"). Simply run it in your terminal in the parent directory of the cloned project.

---

**Author:** Kaan Duran