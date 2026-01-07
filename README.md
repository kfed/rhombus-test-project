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
  npx playwright test
  ```

- **Run tests in headed mode:**
  ```bash
  npx playwright test --headed
  ```

- **View HTML report:**
  ```bash
  npx playwright show-report
  ```

## Test Data

- Credentials are stored in `fixtures/user.json`.

## Adding Tests

- Add new test files in the `tests/` directory.
- Use the Page Object Model in `pages/` for maintainability.

## CI/CD

- Ensure tests run in headless mode for CI.
- Reports are generated in HTML format for review.

## Troubleshooting

- If browsers are missing, run `npx playwright install chromium`.
- For flaky tests, check selectors and add appropriate waits.

---

**Author:** Kaan Duran