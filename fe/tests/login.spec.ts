import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should login successfully with valid user credentials", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Wait for the email input and fill it
    await page.waitForSelector("#email");
    await page.fill("#email", "user@example.com");

    // Fill the password input
    await page.fill("#password", "userpassword");

    // Click the submit button
    // The button has text "Masuk ke Dashboard"
    await page.click('button[type="submit"]');

    // After login, we expect a redirect to the user dashboard page (/user)
    await expect(page).toHaveURL(/\/user/);

    // Verify dashboard content is visible (contains "Overview")
    const overviewText = page.locator("text=Overview");
    await expect(overviewText).toBeVisible({ timeout: 10000 });
  });

  test("should login successfully with valid admin credentials", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Wait for the email input and fill it
    await page.waitForSelector("#email");
    await page.fill("#email", "admin@example.com");

    // Fill the password input
    await page.fill("#password", "adminpassword");

    // Click the submit button
    await page.click('button[type="submit"]');

    // After login, we expect a redirect to the admin page (/admin)
    await expect(page).toHaveURL(/\/admin/);
  });

  test("should display error message on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.waitForSelector("#email");
    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "wrongpassword");

    await page.click('button[type="submit"]');

    // Wait for the error block/toast or general error message to be visible
    // The LoginForm component has:
    // {errors.general && ( <div className="...text-red-500"> <span>⚠️</span> <span>{errors.general}</span> </div> )}
    // Let's assert that the text is present
    const errorMessage = page.locator("text=Email atau password salah");
    await expect(errorMessage).toBeVisible();
  });
});
