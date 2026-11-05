import { Locator, Page } from '@playwright/test';
import { ShoppingCartPage } from './ShoppingCartPage';

export class ProductPage {
    private readonly page: Page;

    // Locators
    private readonly productPrice: Locator;
    private readonly quantityInput: Locator;
    private readonly addToCartButton: Locator;
    private readonly addedToCartMessage: Locator;
    private readonly shoppingCartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.productPrice = page.locator('#content .list-unstyled h2').first();
        this.quantityInput = page.getByLabel('Qty');
        this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
        this.addedToCartMessage = page.getByText('Success: You have added', { exact: false });
        this.shoppingCartLink = page.locator('#top-links').getByRole('link', { name: /Shopping Cart/ });
    }

    /**
     * Checks whether the expected product detail page is displayed.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true if the product heading is displayed
     */
    async isProductDetailsPageExists(productName: string): Promise<boolean> {
        return await this.page.getByRole('heading', { name: productName, exact: true }).isVisible();
    }

    /**
     * Reads the displayed product price.
     * @returns Promise<string> - Formatted product price
     */
    async getProductPrice(): Promise<string> {
        return await this.productPrice.innerText();
    }

    /**
     * Reads the selected product quantity.
     * @returns Promise<string> - Selected quantity
     */
    async getQuantity(): Promise<string> {
        return await this.quantityInput.inputValue();
    }

    /**
     * Adds the product to the shopping cart.
     * @returns Promise<void>
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
        await this.addedToCartMessage.waitFor({ state: 'visible' });
    }

    /**
     * Opens the shopping cart.
     * @returns Promise<ShoppingCartPage>
     */
    async openShoppingCart(): Promise<ShoppingCartPage> {
        await Promise.all([
            this.page.waitForURL(/route=checkout\/cart/),
            this.shoppingCartLink.click(),
        ]);
        return new ShoppingCartPage(this.page);
    }
}
