import { BASE_URL } from '../utils/config.js';

class LoginPage {
  static selectors = {
    loginButton: 'button:has-text("Log In")',
    emailInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    dashboardOption: 'span:has-text("Dashboard")',
  };
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(`${BASE_URL}`);
  }

  async clickLogin() {
    await this.page.click(LoginPage.selectors.loginButton);
  }

  async login(username = process.env.RHOMBUS_USERNAME, password = process.env.RHOMBUS_PASSWORD) {
    await this.clickLogin();
    await this.page.fill(LoginPage.selectors.emailInput, username);
    await this.page.fill(LoginPage.selectors.passwordInput, password);
    await this.page.click(LoginPage.selectors.submitButton);
  }

  async loginAndGotoMain(username = process.env.RHOMBUS_USERNAME, password = process.env.RHOMBUS_PASSWORD) {
    await this.goto();
    await this.login(username, password);
    await this.page.waitForSelector(LoginPage.selectors.dashboardOption, { timeout: 10000 });
  }
}

export { LoginPage };