// pages/sauce-demo/login-page.ts
import { Page, Locator, expect } from "@playwright/test";
import { SauceDemoBasePage } from "./sauce-demo-base-page";

export class LoginPage extends SauceDemoBasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.logo = page.locator(".login_logo");
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.navigate("/");
    await this.waitForPageLoad();
    // Verify we're on the login page
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Login with username and password
   * @param username Username for login
   * @param password Password for login
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    // Click and return. Callers assert the outcome (inventory URL or an error
    // message), so this method stays valid for both positive and negative cases.
    // The old waitForNavigation() race lost against fast navigations, waited out
    // a 10s timeout, then clicked Login a second time.
    await this.loginButton.click();
  }

  /**
   * Get error message text when login fails
   * @returns Error message text
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    return this.getText(this.errorMessage);
  }

  /**
   * Check if error message is displayed
   * @returns Boolean indicating if error message is present
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Perform successful login and verify redirect
   * @param username Valid username
   * @param password Valid password
   * @param expectedRedirectUrl Expected URL after login
   */
  async loginAndVerifyRedirect(
    username: string,
    password: string,
    expectedRedirectUrl: string = "/inventory.html"
  ): Promise<void> {
    await this.login(username, password);

    // Wait for redirect and verify URL
    await this.page.waitForURL(`**${expectedRedirectUrl}`, { timeout: 10000 });
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).toContain(expectedRedirectUrl);
  }

  /**
   * Test login with invalid credentials and verify error
   * @param username Invalid username
   * @param password Invalid password
   * @param expectedErrorText Expected error message
   */
  async verifyLoginFailure(
    username: string,
    password: string,
    expectedErrorText?: string
  ): Promise<void> {
    await this.login(username, password);

    // Check error is displayed
    await expect(this.errorMessage).toBeVisible();

    // If expected error text provided, verify it
    if (expectedErrorText) {
      const actualError = await this.getErrorMessage();
      expect(actualError).toContain(expectedErrorText);
    }
  }
}
