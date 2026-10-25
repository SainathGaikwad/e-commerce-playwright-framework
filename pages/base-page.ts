import { Page, Locator, expect, ElementHandle } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;
  readonly loadingIndicator: Locator;

  /**
   * @param page Playwright page instance
   * @param baseUrl Base URL for the site
   */
  constructor(page: Page, baseUrl: string = "") {
    this.page = page;
    this.baseUrl = baseUrl;
    this.loadingIndicator = page.locator(".loading-indicator");
  }

  /**
   * Navigate to a path relative to the base URL
   * @param path Path relative to base URL
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState("domcontentloaded");

    // If there's a loading indicator, wait for it to disappear
    if (await this.loadingIndicator.isVisible()) {
      await this.loadingIndicator.waitFor({ state: "hidden", timeout: 30000 });
    }
  }

  /**
   * Click an element and wait for navigation
   * @param locator Element to click
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    // Playwright's click() already waits for any navigation it triggers.
    // waitForNavigation() is deprecated and races against fast navigations.
    await locator.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Get text content from an element
   * @param locator Element to get text from
   * @returns Text content
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || "";
  }

  /**
   * Check if element exists on the page
   * @param locator Element to check
   * @returns Boolean indicating if element exists
   */
  async isElementPresent(locator: Locator): Promise<boolean> {
    return (await locator.count()) > 0;
  }

  /**
   * Wait for element to be visible with custom timeout
   * @param locator Element to wait for
   * @param timeout Custom timeout in milliseconds
   */
  async waitForElementVisible(
    locator: Locator,
    timeout?: number
  ): Promise<void> {
    await locator.waitFor({ state: "visible", timeout: timeout });
  }

  /**
   * Scroll to specific element
   * @param locator Element to scroll to
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get current URL
   * @returns Current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
