import { Locator, Page } from '@playwright/test';

export class ShoppingCartPage {
    private readonly page: Page;

    // Locators
    private readonly productRows: Locator;
    private readonly totalsTable: Locator;
    private readonly totalRow: Locator;
    private readonly availabilityWarning: Locator;
    private readonly cartHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.productRows = page.locator('#content table.table-bordered tbody tr');
        this.totalsTable = page.locator('#content table.table-bordered').filter({ hasText: 'Sub-Total:' });
        this.totalRow = this.totalsTable.getByRole('row').filter({ hasText: 'Total:' });
        this.availabilityWarning = page.getByText(
            'Products marked with *** are not available in the desired quantity or not in stock!',
            { exact: false },
        );
        this.cartHeading = page.getByRole('heading', { name: /Shopping Cart/ });
    }

    /**
     * Checks whether the shopping cart page is displayed.
     * @returns Promise<boolean> - true if the cart heading is displayed
     */
    async isShoppingCartPageExists(): Promise<boolean> {
        return await this.cartHeading.isVisible();
    }

    private getProductRow(productName: string): Locator {
        return this.productRows.filter({
            has: this.page.getByRole('link', { name: productName, exact: true }),
        });
    }

    /**
     * Reads a product name from the cart.
     * @param productName - Expected product name
     * @returns Promise<string> - Product name displayed in the cart
     */
    async getProductName(productName: string): Promise<string> {
        return await this.getProductRow(productName)
            .getByRole('link', { name: productName, exact: true })
            .last()
            .innerText();
    }

    /**
     * Reads a product quantity from the cart.
     * @param productName - Product name identifying the cart row
     * @returns Promise<string> - Quantity displayed in the cart
     */
    async getProductQuantity(productName: string): Promise<string> {
        return await this.getProductRow(productName).locator('input[name^="quantity"]').inputValue();
    }

    /**
     * Reads the unit price from a cart row.
     * @param productName - Product name identifying the cart row
     * @returns Promise<string> - Formatted unit price
     */
    async getProductPrice(productName: string): Promise<string> {
        return await this.getProductRow(productName).locator('td.text-right').nth(0).innerText();
    }

    /**
     * Reads the line total from a cart row.
     * @param productName - Product name identifying the cart row
     * @returns Promise<string> - Formatted line total
     */
    async getProductTotal(productName: string): Promise<string> {
        return await this.getProductRow(productName).locator('td.text-right').nth(1).innerText();
    }

    /**
     * Reads the grand total displayed in the cart.
     * @returns Promise<string> - Formatted cart total
     */
    async getCartTotal(): Promise<string> {
        return await this.totalRow.getByRole('cell').last().innerText();
    }

    /**
     * Checks whether the cart reports an unavailable or out-of-stock item.
     * @returns Promise<boolean> - true if an availability warning is displayed
     */
    async isAvailabilityWarningVisible(): Promise<boolean> {
        return await this.availabilityWarning.isVisible();
    }
}
