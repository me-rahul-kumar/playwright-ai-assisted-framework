import { Locator, Page } from '@playwright/test';
import { AccountPage } from './AccountPage';

export class LoginPage {
    private readonly page: Page;

    // Locators
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.emailInput = page.getByLabel('E-Mail Address');
        this.passwordInput = page.getByLabel('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    }

    /**
     * Logs in a customer.
     * @param email - Registered customer email
     * @param password - Registered customer password
     * @returns Promise<AccountPage>
     */
    async login(email: string, password: string): Promise<AccountPage> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await Promise.all([
            this.page.waitForURL(/route=account\/account/),
            this.loginButton.click(),
        ]);
        return new AccountPage(this.page);
    }
}
