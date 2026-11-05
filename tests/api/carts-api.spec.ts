import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('Carts API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const CART_ID = Number(process.env.CART_ID ?? 1);
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const START_DATE = process.env.START_DATE || '2019-12-10';
    const END_DATE = process.env.END_DATE || '2020-10-10';
    const TEST_DATA = DataProvider.readJson('./testdata/fakestore_api_data.json');

    // ---------------------------------------------------------
    // GET - All Carts
    // ---------------------------------------------------------

    test('GET - All Carts @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);

        expect(response.status(), 'GET all carts should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        for (const cart of responseBody) {
            const cartDate = String(cart.date).slice(0, 10);
            expect(cartDate >= START_DATE && cartDate <= END_DATE,
                `Cart date ${cartDate} should be within the requested date range`).toBeTruthy();
        }
        expect(responseBody.length, 'Cart array should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - Cart by ID
    // ---------------------------------------------------------

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET cart by ID should return HTTP 200').toBe(200);

        const cart = await response.json();

        expect(cart.id, 'Returned cart ID should match the requested ID').toBe(CART_ID);
    });

    // ---------------------------------------------------------
    // GET - Carts by Date Range
    // ---------------------------------------------------------

    test('GET - Carts by Date Range @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_CARTS_BY_DATE_RANGE
            .replace('{startdate}', START_DATE)
            .replace('{enddate}', END_DATE)}`;

        const response = await request.get(url);

        expect(response.status(), 'GET carts by date range should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        for (const cart of responseBody) {
            const cartDate = String(cart.date).slice(0, 10);
            expect(cartDate >= START_DATE && cartDate <= END_DATE,
                `Cart date ${cartDate} should be within the requested date range`).toBeTruthy();
        }
    });

    // ---------------------------------------------------------
    // GET - User Cart
    // ---------------------------------------------------------

    test('GET - User Cart @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_USER_CART.replace('{userId}', String(USER_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET user cart should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        for (const cart of responseBody) {
            expect(cart.userId, `Cart should belong to user ${USER_ID}`).toBe(USER_ID);
        }
    });

    // ---------------------------------------------------------
    // GET - Carts with Limit
    // ---------------------------------------------------------

    test('GET - Carts with Limit @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(LIMIT))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET carts with limit should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        expect(responseBody.length, `Should return exactly ${LIMIT} carts`).toBe(LIMIT);
    });

    // ---------------------------------------------------------
    // GET - Sort Carts Ascending
    // ---------------------------------------------------------

    test('GET - Sort Carts Ascending @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_CARTS_SORTED.replace('{order}', 'asc')}`;

        const response = await request.get(url);

        expect(response.status(), 'GET sorted carts (asc) should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        const ids = responseBody.map((cart: { id: number }) => cart.id);
        const sortedIds = [...ids].sort((a, b) => a - b);

        expect(ids, 'Cart IDs should be in ascending order').toEqual(sortedIds);
    });

    // ---------------------------------------------------------
    // GET - Sort Carts Descending
    // ---------------------------------------------------------

    test('GET - Sort Carts Descending @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_CARTS_SORTED.replace('{order}', 'desc')}`;

        const response = await request.get(url);

        expect(response.status(), 'GET sorted carts (desc) should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        const ids = responseBody.map((cart: { id: number }) => cart.id);
        const sortedIds = [...ids].sort((a, b) => b - a);

        expect(ids, 'Cart IDs should be in descending order').toEqual(sortedIds);
    });

    // ---------------------------------------------------------
    // POST - Create Cart
    // ---------------------------------------------------------

    test('POST - Create Cart @master @regression @api', async ({ request }) => {

        const payload = {
            userId: USER_ID,
            ...TEST_DATA.cart,
        };

        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: payload,
        });

        expect(response.status(), 'Create cart should return HTTP 201').toBe(201);

        const created = await response.json();

        expect(created.id, 'Created cart should have an ID').toBeTruthy();
        expect(created.userId, 'Created cart should contain the submitted user ID').toBe(payload.userId);
        expect(created.products, 'Created cart should contain the submitted products').toEqual(payload.products);
    });

    // ---------------------------------------------------------
    // PUT - Update Cart
    // ---------------------------------------------------------

    test('PUT - Update Cart @master @regression @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.UPDATE_CART.replace('{id}', String(CART_ID))}`;

        const existingCartResponse = await request.get(
            `${BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID))}`
        );
        expect(existingCartResponse.status(), 'GET cart before update should return HTTP 200').toBe(200);
        const existingCart = await existingCartResponse.json();
        const updatedProducts = existingCart.products.map(
            (product: { productId: number; quantity: number }, index: number) => ({
                ...product,
                quantity: index === 0 ? product.quantity + 1 : product.quantity,
            })
        );
        const payload = {
            userId: existingCart.userId,
            date: existingCart.date,
            products: updatedProducts,
        };

        const response = await request.put(url, {
            data: payload,
        });

        expect(response.status(), 'Update cart should return HTTP 200').toBe(200);

        const updated = await response.json();

        expect(updated.id, 'Updated cart ID should match the requested ID').toBe(CART_ID);
        expect(updated.products[0].quantity, 'Updated cart should reflect the increased product quantity')
            .toBe(payload.products[0].quantity);
    });

    // ---------------------------------------------------------
    // DELETE - Delete Cart
    // ---------------------------------------------------------

    test('DELETE - Delete Cart @master @regression @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.DELETE_CART.replace('{id}', String(CART_ID))}`;

        const response = await request.delete(url);

        expect(response.status(), 'Delete cart should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Delete response should identify the deleted cart').toBe(CART_ID);
    });
});
