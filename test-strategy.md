# Test Strategy for Rhombus AI

## 1. Top Regression Risks

### 1.1 Registration and Login Issues
- **High Impact:** Unable to register or login will make users unable to use the app.
- **Regression Likelihood:** Low unless there is a change to user types, permissions or SSO integrations.
- **Mitigation Layer(s):** UI and API tests for register, login/logout, SSO login and negative tests for unauthorised access.

### 1.2 Data Input Failures
- **High Impact:** After registration/login, the data input is foundational for all other features to work.
- **Regression Likelihood:** Low unless there is a change to data format types or the file ingestion functionalities.
- **Mitigation Layer(s):** API tests for schema validation and error handling.

### 1.3 Data Transformation Errors
- **High Impact:** Errors with transformations can fail the pipeline or corrupt the data leading to unexpected outputs.
- **Regression Likelihood:** High since transformation logic is complex with many different permutations. Also it relies on data input to be as expected and if AI is used then the AI to set it up correctly; any of which could cause issues here even if the transformation logic and functionality is working as expected.
- **Mitigation Layer(s):** Unit tests for transformation functions, integration tests for end-to-end data flow, and data validation tests.

### 1.4 Data Export/Download Issues
- **High Impact:** Users expect the final transformed file. Being unable to get it makes all prior features redundant.
- **Regression Likelihood:** Low unless changes to export formats or functions or third-party integration changes.
- **Mitigation Layer(s):** API tests for file content validation of exported files, UI tests for download workflows. Also if possible have Azure, AWS and Google buckets available for E2E testing of real exports.

### 1.5 AI-Assisted Pipeline 
- **High Impact:** AI-driven features are core to the product; degraded performance or incorrect outputs directly impact user trust and value.
- **Regression Likelihood:** Medium since many features can change what the model does: an update to the AI Model as well as changes to all other in application features could change how the prompts are followed.
- **Mitigation Layer(s):** Regression tests with fixed prompts and output which outlines the exact node setup.

---

## 2. Automation Prioritization

### What to Automate First
- **Critical UI User Flows:** Automate register/login and password reset, data input, transformation and data output first, since these are all key functionality that users will frequently perform and therefore the highest risk and reward. Dashboard and Settings screen should also be tested but with lower priority.
Note that not all transformation types need to be exhaustively tested - prioritise and build them in order of the mostly commonly used types in production.
- **API Tests:** Ensure backend endpoints are stable. Does not have to be extensive, more of a smoke test as a minimum initially. After that, move on to more tests that are hard to do via the UI (e.g. try to access another user's projects, negative tests for unusual requests/responses, mock responses, etc.)
- **Data Validation Script:** Automate checks for data correctness after ingestion and transformation.
- **Core AI Model Prompts:** This is a lower priority and would be done after the above have sufficient coverage. Rationale is that the AI is an assistant and is optional - however the user needs to always be able to manually create workflows (and that functionality is also needed for AI to also be able to do it).

### What Not to Automate Yet
- **UI Testing for Third Party Integrations:** Testing AWS, Azure and Google buckets receive the files is a very low priority for UI automation. Testing is mainly the responsibility for the third parties, however monitors should be placed in production for errors (e.g. logs).
- **Currently Unused Features:** If any features are not used or unavailable, there is no need to automate them unless a production release is planned soon.
- **All Other AI Capabilities:** AI functionality is a lower priority to exhaustively test and the focus should be on key AI prompts and support functions. Tests for the AI feature will be more brittle than tests for other features.

---

## 3. Test Layering Strategy

### UI E2E Testing
- **Purpose:** Validate critical user journeys as experienced by real users.
- **Failures Types:** UI regression issues.
- **Examples:** Login, data import, transformation, data export/download, and AI-assisted actions.

### API Testing
- **Purpose:** Ensure backend services behave correctly.
- **Failures Types:** Backend service issues (deployment error, server error, etc).
- **Examples:** Data import/export APIs, Get User, Project and Node APIs, Transformation APIs, etc.

### Data Validation
- **Purpose:** Verify that data is correctly ingested, transformed, and output.
- **Failures Types:** Transformation errors.
- **Examples:** Use another method (such as a JS script) to ensure the transformation output via the UI matches the script output generated using the transformation logic via the test JS script.

---

## 4. Regression Strategy

### On Every Pull Request
- **Run:** Fast, critical smoke tests (UI and API) that can run ideally within a minute.
- **Goal:** Quick initial check to catch major breaking changes early without slowing down development.
Confidence in the system is low from such a check.
- **Release Blocking:** Any issue here is a release blocker!

### Nightly Runs (also Ad-hoc Runs as needed)
- **Run:** Full regression suite - all UI, API and Data Validation tests.
- **Goal:** Run all of the tests after hours so that time is not a factor (or in an ad-hoc manner prior to a release or to confirm an issue with the previous night's run). The next morning, a report can highlight any issues that need addressing.
- **Release Blocking:** Any issue here is not necessarily a blocker. Each issue would have to be reviewed to ensure its valid and not a one off issue (e.g. server went down for maintenance during the test run). The idea here would be to have these tests regularly returning green results to inspire confidence.

---

## 5. Testing AI-Driven Behavior

### Assertions and Stability
- **What to Assert:** Focus on specific logical node setups using specific prompts with Rhombus-specific language. Assert that the specified nodes are setup as listed.
- **Reaching Stability:** Being specific and focusing on logical node setups should have less brittleness even if there is a model updates or minor UI update to functionality.
- **What to Avoid:** Ambiguous and vague prompts with little detail.
- **Keeping it Real... and Deterministic:** As mentioned above, be really specific with the prompts and use Rhombus-specific language where possible (e.g. 'create a "Normalize Data Transform" node that is linked to ...')

---

## 6. Test Reliability and Maintenance

### Common Causes of Flaky Tests in Rhombus AI

- **Dynamic UI Elements:** Elements that load asynchronously or change state (e.g. notifications like "Pipeline completed") may not be ready when assertions run. Sections like the dashboard change dynamically and will be difficult to verify correctly unless the tests are heavily controlled.
- **Network Latency:** API responses or data ingestion may be delayed, causing timeouts or race conditions.
- **AI Output Variability:** Non-deterministic AI-assisted features can produce slightly different results on each run.
- **Test Data Dependencies:** Tests relying on shared or mutable data can interfere with each other.
- **Selector Instability:** UI changes or non-unique selectors can cause tests to interact with the wrong elements.
- **Improper Clean Up:** All user data must be returned to its original state after each test execution run. If not properly done then this can interfere with future runs and give unexpected results and failures.

### Detecting Flakiness Over Time

- **Test Reruns:** Configure CI to rerun failed tests automatically and track if failures are intermittent.
- **Flakiness Dashboards:** Use test reporting tools to visualize and track test pass/fail rates over time. At the very least, the team should view the reports generated each morning following the previous night's run.
- **Failure Patterns:** Analyze CI logs for tests that fail inconsistently or only under certain conditions.

### Reducing, Quarantining, or Eliminating Flaky Tests

- **Stabilize Selectors:** Use robust, unique selectors and avoid relying on text or position alone.
- **Explicit Waits:** Wait for elements or network responses to be ready before interacting or asserting. This is easy in Playwright since this feature is built into the tool (e.g. using "await" for async execution).
- **Isolate Test Data:** Use unique or isolated test data for each run to prevent cross-test interference. Also clean up test data before and/or after test execution to ensure the same state is reached before any new tests are run.
- **Quarantine Flaky Tests:** Move persistently flaky tests to a quarantine suite so they don’t block releases, and prioritize fixing them. Tests for broken features that are low priority to fix should also be quarantined (because ideally these should be ignored if the fix for the issues are being postponed).
- **Review and Refactor:** Regularly review flaky tests, refactor for stability, or remove low-value tests that cannot be stabilized.
- **Mock External Dependencies:** For certain features that need more control, consider mocking API responses to reduce variability.

---

**Author:** Kaan Duran