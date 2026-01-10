import { BASE_URL } from '../utils/config.js';

class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginButton = 'button:has-text("Log In")';
    this.emailInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
    this.submitButton = 'button[type="submit"]';
  }

  async goto() {
    await this.page.goto('${BASE_URL}');
  }

  async clickLogin() {
    await this.page.click(this.loginButton);
  }

  async login(username, password) {
    await this.clickLogin();
    await this.page.fill(this.emailInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }
}

export { LoginPage };