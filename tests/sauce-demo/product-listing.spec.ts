// tests/sauce-demo/product-listing.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/sauce-demo/login-page";
import { ProductListPage } from "../../pages/product-list-page";

test.describe("Product Listing Page", () => {
  let productListPage: ProductListPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
    await expect(page).toHaveURL(/inventory\.html/);

    productListPage = new ProductListPage(page);
    await expect(productListPage.productTitles.first()).toBeVisible();
  });

  test("Display products", async () => {
    await expect(productListPage.productTitles).toHaveCount(6);
    await expect(productListPage.productTitles.first()).toBeVisible();
    await expect(productListPage.productPrices.first()).toBeVisible();
    await expect(productListPage.productDescriptions.first()).toBeVisible();
  });

  test("Add products to cart", async () => {
    await productListPage.addProductToCart(0);
    await expect(productListPage.cartBadge).toHaveText("1");
    await expect(productListPage.removeButtons).toHaveCount(1);
  });

  test("Remove products from cart", async () => {
    await productListPage.addProductToCart(0);
    await expect(productListPage.cartBadge).toHaveText("1");

    await productListPage.removeProductFromCart(0);
    await expect(productListPage.cartBadge).toBeHidden();
    await expect(productListPage.removeButtons).toHaveCount(0);
  });
});
