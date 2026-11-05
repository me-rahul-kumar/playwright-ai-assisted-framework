import { Locator, Page } from '@playwright/test';

export class LogoutPage {
    private readonly page: Page;

    // Locators
    private readonly logoutHeading: Locator;
    private readonly logoutMessage: Locator;
    private readonly continueLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.logoutHeading = page.getByRole('heading', { name: 'Account Logout', exact: true });
        this.logoutMessage = page.getByText(
            'You have been logged off your account.',
            { exact: false },
        );
        this.continueLink = page.getByRole('link', { name: 'Continue', exact: true });
    }

    /**
     * Checks whether logout completed successfully.
     * @returns Promise<boolean> - true if the logout confirmation is displayed
     */
    async isLogoutSuccessful(): Promise<boolean> {
        return await this.logoutHeading.isVisible() && await this.logoutMessage.isVisible();
    }

    /**
     * Continues from the logout page to the storefront.
     * @returns Promise<void>
     */
    async continueToHome(): Promise<void> {
        await Promise.all([
            this.page.waitForURL(/route=common\/home/),
            this.continueLink.click(),
        ]);
    }
}
