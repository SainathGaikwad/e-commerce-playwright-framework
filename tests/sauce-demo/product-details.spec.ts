// tests/sauce-demo/product-details.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/sauce-demo/login-page";
import { ProductDetailsPage } from "../../pages/sauce-demo/product-details-page";

test.describe("Product Details Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");

    // Verify we're logged in and on the inventory page
    await expect(page).toHaveURL(/inventory.html/);
  });

  test("View product details", async ({ page }) => {
    // Navigate directly to a product details page (using ID 4 for "Sauce Labs Backpack")
    const productDetailsPage = new ProductDetailsPage(page);
    await productDetailsPage.goto("4");

    // Verify product details are displayed
    const productName = await productDetailsPage.getProductName();
    const productDescription = await productDetailsPage.getProductDescription();
    const productPrice = await productDetailsPage.getProductPrice();

    expect(productName).toBeTruthy();
    expect(productDescription).toBeTruthy();
    expect(productPrice).toContain("$");
  });

  test("Add to cart from product details", async ({ page }) => {
    const productDetailsPage = new ProductDetailsPage(page);
    await productDetailsPage.goto("4");

    // Add to cart
    await productDetailsPage.addToCart();

    // Verify product is in cart
    expect(await productDetailsPage.isProductInCart()).toBeTruthy();

    // Verify remove button is visible
    await expect(productDetailsPage.removeButton).toBeVisible();
  });

  test("Remove from cart in product details", async ({ page }) => {
    const productDetailsPage = new ProductDetailsPage(page);
    await productDetailsPage.goto("4");

    // Add to cart first
    await productDetailsPage.addToCart();
    expect(await productDetailsPage.isProductInCart()).toBeTruthy();

    // Remove from cart
    await productDetailsPage.removeFromCart();

    // Verify product is not in cart
    expect(await productDetailsPage.isProductInCart()).toBeFalsy();

    // Verify add to cart button is visible again
    await expect(productDetailsPage.addToCartButton).toBeVisible();
  });

  // test("Navigate back to products", async ({ page }) => {
  //   const productDetailsPage = new ProductDetailsPage(page);
  //   await productDetailsPage.goto("4");

  //   // Go back to products
  //   await productDetailsPage.goBackToProducts();

  //   // Verify we're back on inventory page
  //   await expect(page).toHaveURL(/inventory.html/);
  // });

  // In the "Navigate back to products" test:
  test("Navigate back to products", async ({ page, browserName }) => {
    // Get a product ID - Sauce Labs Backpack is 4
    const productId = "4";
    const productDetailsPage = new ProductDetailsPage(page);

    try {
      // First login
      await page.goto("https://www.saucedemo.com/");
      await page.fill('[data-test="username"]', "standard_user");
      await page.fill('[data-test="password"]', "secret_sauce");
      await page.click('[data-test="login-button"]');

      // Navigate to product details
      await productDetailsPage.goto(productId);

      // Wait for product details to load
      await page.waitForSelector(".inventory_details_name", {
        state: "visible",
      });

      // Click back button with a WebKit workaround if needed
      if (browserName === "webkit" || browserName.includes("Safari")) {
        // Use a more direct navigation approach for WebKit
        await page.evaluate(() => {
          // Use JavaScript to click the button
          const backButton = document.querySelector(
            '[data-test="back-to-products"]'
          );
          if (backButton) {
            (backButton as HTMLElement).click();
          }
        });

        // Wait for the inventory page URL or content
        await page.waitForURL("**/inventory.html", { timeout: 10000 });
      } else {
        // For other browsers, use the page object method
        await productDetailsPage.goBackToProducts();
      }

      // Verify we're back on inventory page
      await expect(page).toHaveURL(/inventory.html/);
    } catch (error) {
      console.error("Navigate back test failed:", error);
      await page.screenshot({ path: "test-results/screenshots/navigate-back-error.png" });
      throw error;
    }
  });
});
