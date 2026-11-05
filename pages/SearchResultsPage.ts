import { Page } from '@playwright/test';
import { ProductPage } from './ProductPage';

export class SearchResultsPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Opens a matching product from the search results.
     * @param productName - Exact product name to open
     * @returns Promise<ProductPage>
     */
    async openProduct(productName: string): Promise<ProductPage> {
        const productHeading = this.page.getByRole('heading', { name: productName, exact: true });
        await Promise.all([
            this.page.waitForURL(/route=product\/product/),
            productHeading.getByRole('link', { name: productName, exact: true }).click(),
        ]);
        return new ProductPage(this.page);
    }
}
