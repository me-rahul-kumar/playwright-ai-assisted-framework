import { test, expect } from '../../fixtures/pageFixtures';
import { AccountPage } from '../../pages/AccountPage';
import { LogoutPage } from '../../pages/LogoutPage';
import { ProductPage } from '../../pages/ProductPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { SearchResultsPage } from '../../pages/SearchResultsPage';
import { ShoppingCartPage } from '../../pages/ShoppingCartPage';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-end shopping flow @master @regression @web @end-to-end', async ({ homePage, page }) => {
    const customer = RandomDataUtil.generateCustomerData();
    const product = Helper.getProductDetails();
    const pageErrors: Error[] = [];
    let registrationPage: RegisterPage;
    let accountPage: AccountPage;
    let logoutPage: LogoutPage;
    let loginAccountPage: AccountPage;
    let searchResultsPage: SearchResultsPage;
    let productPage: ProductPage;
    let shoppingCartPage: ShoppingCartPage;

    page.on('pageerror', error => pageErrors.push(error));

    await test.step('1) Open the application', async () => {
        await homePage.waitForHomePage();
    });

    await test.step('2) Register a new customer with unique data', async () => {
        await homePage.openMyAccountMenu();
        registrationPage = await homePage.clickRegister();
        await registrationPage.registerCustomer(customer);
    });

    await test.step('3) Verify successful registration', async () => {
        expect(await registrationPage.isRegistrationSuccessful()).toBeTruthy();
        accountPage = await registrationPage.continueToAccount();
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('4) Log out', async () => {
        logoutPage = await accountPage.logout();
        expect(await logoutPage.isLogoutSuccessful()).toBeTruthy();
        await logoutPage.continueToHome();
    });

    await test.step('5) Log in with the new customer credentials', async () => {
        await homePage.openMyAccountMenu();
        const loginPage = await homePage.clickLogin();
        loginAccountPage = await loginPage.login(customer.email, customer.password);
    });

    await test.step('6) Verify successful authentication', async () => {
        expect(await loginAccountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('7) Search for the known product', async () => {
        await homePage.goToHome();
        searchResultsPage = await homePage.searchForProduct(product.productName);
    });

    await test.step('8) Open the product details page', async () => {
        productPage = await searchResultsPage.openProduct(product.productName);
        expect(await productPage.isProductDetailsPageExists(product.productName)).toBeTruthy();
    });

    await test.step('9) Add the product to the cart', async () => {
        expect(await productPage.getQuantity()).toBe(product.productQuantity);
        expect(await productPage.getProductPrice()).toBe(product.productPrice);
        await productPage.addToCart();
    });

    await test.step('10) Open the shopping cart', async () => {
        shoppingCartPage = await productPage.openShoppingCart();
        expect(await shoppingCartPage.isShoppingCartPageExists()).toBeTruthy();
    });

    await test.step('11) Verify the correct product', async () => {
        expect(await shoppingCartPage.getProductName(product.productName)).toBe(product.productName);
    });

    await test.step('12) Verify the quantity', async () => {
        expect(await shoppingCartPage.getProductQuantity(product.productName)).toBe(product.productQuantity);
    });

    await test.step('13) Verify the product price', async () => {
        expect(await shoppingCartPage.getProductPrice(product.productName)).toBe(product.productPrice);
    });

    await test.step('14) Verify the product and cart totals', async () => {
        expect(await shoppingCartPage.getProductTotal(product.productName)).toBe(product.totalPrice);
        expect(await shoppingCartPage.getCartTotal()).toBe(product.totalPrice);
    });

    await test.step('15) Verify the journey completed without errors', async () => {
        expect(await shoppingCartPage.isAvailabilityWarningVisible()).toBeFalsy();
        expect(pageErrors.map(error => error.message)).toEqual([]);
    });

    console.log('✅ ✔️ Completed end-to-end shopping flow successfully!');
});
