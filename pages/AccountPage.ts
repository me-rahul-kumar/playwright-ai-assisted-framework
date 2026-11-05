import { Locator, Page } from '@playwright/test';
import { LogoutPage } from './LogoutPage';

export class AccountPage {
    private readonly page: Page;

    // Locators
    private readonly accountHeading: Locator;
    private readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.accountHeading = page.locator('#content').getByRole('heading', { name: 'My Account', exact: true });
        this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
    }

    /**
     * Checks whether the customer account page is displayed.
     * @returns Promise<boolean> - true if the account page is displayed
     */
    async isMyAccountPageExists(): Promise<boolean> {
        return await this.accountHeading.isVisible();
    }

    /**
     * Logs out the current customer.
     * @returns Promise<LogoutPage>
     */
    async logout(): Promise<LogoutPage> {
        await Promise.all([
            this.page.waitForURL(/route=account\/logout/),
            this.logoutLink.click(),
        ]);
        return new LogoutPage(this.page);
    }
}
