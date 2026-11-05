import { Locator, Page } from '@playwright/test';
import { CustomerRegistrationData } from '../utils/dataGenerator';
import { AccountPage } from './AccountPage';

export class RegisterPage {
    private readonly page: Page;

    // Locators
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly telephoneInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly continueButton: Locator;
    private readonly successHeading: Locator;
    private readonly successMessage: Locator;
    private readonly successContinueLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.firstNameInput = page.getByLabel('First Name');
        this.lastNameInput = page.getByLabel('Last Name');
        this.emailInput = page.getByLabel('E-Mail');
        this.telephoneInput = page.getByLabel('Telephone');
        this.passwordInput = page.getByLabel('Password', { exact: true });
        this.confirmPasswordInput = page.getByLabel('Password Confirm');
        this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
        this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
        this.successHeading = page.getByRole('heading', { name: 'Your Account Has Been Created!', exact: true });
        this.successMessage = page.getByText(
            'Congratulations! Your new account has been successfully created!',
            { exact: true },
        );
        this.successContinueLink = page.getByRole('link', { name: 'Continue', exact: true });
    }

    /**
     * Registers a customer with the supplied details.
     * @param customer - Customer registration details
     * @returns Promise<void>
     */
    async registerCustomer(customer: CustomerRegistrationData): Promise<void> {
        await this.firstNameInput.fill(customer.firstName);
        await this.lastNameInput.fill(customer.lastName);
        await this.emailInput.fill(customer.email);
        await this.telephoneInput.fill(customer.telephone);
        await this.passwordInput.fill(customer.password);
        await this.confirmPasswordInput.fill(customer.password);
        await this.privacyPolicyCheckbox.check();
        await Promise.all([
            this.page.waitForURL(/route=account\/success/),
            this.continueButton.click(),
        ]);
    }

    /**
     * Checks whether the registration confirmation is displayed.
     * @returns Promise<boolean> - true if registration succeeded
     */
    async isRegistrationSuccessful(): Promise<boolean> {
        return await this.successHeading.isVisible() && await this.successMessage.isVisible();
    }

    /**
     * Continues from registration confirmation to the customer account.
     * @returns Promise<AccountPage>
     */
    async continueToAccount(): Promise<AccountPage> {
        await Promise.all([
            this.page.waitForURL(/route=account\/account/),
            this.successContinueLink.click(),
        ]);
        return new AccountPage(this.page);
    }
}
