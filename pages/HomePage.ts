import { Locator, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { SearchResultsPage } from './SearchResultsPage';

export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly searchInput: Locator;
    private readonly accountMenu: Locator;
    private readonly accountDropdown: Locator;
    private readonly homeLogo: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.searchInput = page.getByRole('textbox', { name: 'Search' });
        this.accountMenu = page.locator('#top-links').getByRole('link', { name: /My Account/ });
        this.accountDropdown = page.locator('#top-links .dropdown-menu');
        this.homeLogo = page.getByRole('link', { name: 'TheTestingAcademy eCommerce' });
    }

    /**
     * Waits for the storefront search field to appear.
     * @returns Promise<void>
     */
    async waitForHomePage(): Promise<void> {
        await this.searchInput.waitFor({ state: 'visible' });
    }

    /**
     * Opens the account menu.
     * @returns Promise<void>
     */
    async openMyAccountMenu(): Promise<void> {
        await this.accountMenu.click();
    }

    /**
     * Opens the customer registration page.
     * @returns Promise<RegisterPage>
     */
    async clickRegister(): Promise<RegisterPage> {
        const registerLink = this.accountDropdown.getByRole('link', { name: 'Register', exact: true });
        await Promise.all([
            this.page.waitForURL(/route=account\/register/),
            registerLink.click(),
        ]);
        return new RegisterPage(this.page);
    }

    /**
     * Opens the customer login page.
     * @returns Promise<LoginPage>
     */
    async clickLogin(): Promise<LoginPage> {
        const loginLink = this.accountDropdown.getByRole('link', { name: 'Login', exact: true });
        await Promise.all([
            this.page.waitForURL(/route=account\/login/),
            loginLink.click(),
        ]);
        return new LoginPage(this.page);
    }

    /**
     * Returns to the storefront home page.
     * @returns Promise<void>
     */
    async goToHome(): Promise<void> {
        await Promise.all([
            this.page.waitForURL(/route=common\/home/),
            this.homeLogo.click(),
        ]);
    }

    /**
     * Searches the catalog for a product.
     * @param productName - Product name to search for
     * @returns Promise<SearchResultsPage>
     */
    async searchForProduct(productName: string): Promise<SearchResultsPage> {
        await this.searchInput.fill(productName);
        await Promise.all([
            this.page.waitForURL(/route=product\/search/),
            this.searchInput.press('Enter'),
        ]);
        return new SearchResultsPage(this.page);
    }
}
