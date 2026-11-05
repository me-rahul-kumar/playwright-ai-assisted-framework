import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('Products API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const TEST_DATA = DataProvider.readJson('./testdata/fakestore_api_data.json');

    // ---------------------------------------------------------
    // GET - All Products
    // ---------------------------------------------------------

    test('GET - All Products @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);

        expect(response.status(), 'GET all products should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        expect(responseBody.length, 'At least one product should be returned').toBeGreaterThan(0);

        for (const [index, product] of responseBody.entries()) {
            expect(product, `Product at index ${index} should have the required fields`)
                .toEqual(expect.objectContaining({
                    id: expect.any(Number),
                    title: expect.any(String),
                    price: expect.any(Number),
                    category: expect.any(String),
                    image: expect.any(String),
                }));
        }
    });

    // ---------------------------------------------------------
    // GET - Product by ID
    // ---------------------------------------------------------

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET product by ID should return HTTP 200').toBe(200);

        const product = await response.json();

        expect(product.id, 'Returned product ID should match the requested ID').toBe(PRODUCT_ID);
        expect(product).toEqual(expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            price: expect.any(Number),
            description: expect.any(String),
            category: expect.any(String),
            image: expect.any(String),
        }));
    });

    // ---------------------------------------------------------
    // GET - Products with Limit
    // ---------------------------------------------------------

    test('GET - Products with Limit @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(LIMIT))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET products with limit should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        expect(responseBody.length, `Should return exactly ${LIMIT} products`).toBe(LIMIT);
    });

    // ---------------------------------------------------------
    // GET - Sort Products Ascending
    // ---------------------------------------------------------

    test('GET - Sort Products Ascending @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc')}`;

        const response = await request.get(url);

        expect(response.status(), 'GET sorted products (asc) should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        const ids = responseBody.map((product: { id: number }) => product.id);
        const sortedIds = [...ids].sort((a, b) => a - b);

        expect(ids, 'Product IDs should be in ascending order').toEqual(sortedIds);
    });

    // ---------------------------------------------------------
    // GET - Sort Products Descending
    // ---------------------------------------------------------

    test('GET - Sort Products Descending @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc')}`;

        const response = await request.get(url);

        expect(response.status(), 'GET sorted products (desc) should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        const ids = responseBody.map((product: { id: number }) => product.id);
        const sortedIds = [...ids].sort((a, b) => b - a);

        expect(ids, 'Product IDs should be in descending order').toEqual(sortedIds);
    });

    // ---------------------------------------------------------
    // GET - All Product Categories
    // ---------------------------------------------------------

    test('GET - All Product Categories @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);

        expect(response.status(), 'GET all categories should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        expect(responseBody.length, 'Category list should not be empty').toBeGreaterThan(0);
        expect(responseBody.every((category: unknown) => typeof category === 'string'),
            'Every category should be a string').toBeTruthy();
    });

    // ---------------------------------------------------------
    // GET - Products by Category
    // ---------------------------------------------------------

    test('GET - Products by Category @master @sanity @api', async ({ request }) => {

        const category = 'electronics';
        const url = `${BASE_URL}${Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', category)}`;

        const response = await request.get(url);

        expect(response.status(), 'GET products by category should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        for (const product of responseBody) {
            expect(product.category, `Product should belong to category "${category}"`).toBe(category);
        }
    });

    // ---------------------------------------------------------
    // POST - Create Product
    // ---------------------------------------------------------

    test('POST - Create Product @master @regression @api', async ({ request }) => {

        const payload = TEST_DATA.product;

        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: payload,
        });

        expect(response.status(), 'Create product should return HTTP 201').toBe(201);

        const created = await response.json();

        expect(created.id, 'Created product should have an ID').toBeTruthy();
        expect(created.title, 'Created product should contain the submitted title').toBe(payload.title);
        expect(created.price, 'Created product should contain the submitted price').toBe(payload.price);
        expect(created.description, 'Created product should contain the submitted description').toBe(payload.description);
        expect(created.image, 'Created product should contain the submitted image').toBe(payload.image);
        expect(created.category, 'Created product should contain the submitted category').toBe(payload.category);
    });

    // ---------------------------------------------------------
    // PUT - Update Product
    // ---------------------------------------------------------

    test('PUT - Update Product @master @regression @api', async ({ request }) => {

        const payload = TEST_DATA.updatedProduct;
        const url = `${BASE_URL}${Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID))}`;

        const response = await request.put(url, {
            data: payload,
        });

        expect(response.status(), 'Update product should return HTTP 200').toBe(200);

        const updated = await response.json();

        expect(updated.id, 'Updated product ID should match the requested ID').toBe(PRODUCT_ID);
        expect(updated.title, 'Updated product should contain the updated title').toBe(payload.title);
        expect(updated.price, 'Updated product should contain the updated price').toBe(payload.price);
    });

    // ---------------------------------------------------------
    // DELETE - Delete Product
    // ---------------------------------------------------------

    test('DELETE - Delete Product @master @regression @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID))}`;

        const response = await request.delete(url);

        expect(response.status(), 'Delete product should return HTTP 200').toBe(200);

        const responseBody = await response.json();
        expect(responseBody.id, 'Delete response should identify the deleted product').toBe(PRODUCT_ID);
    });
});
