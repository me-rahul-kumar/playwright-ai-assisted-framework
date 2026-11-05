import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('Cart CRUD Workflow', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const TEST_DATA = DataProvider.readJson('./testdata/fakestore_api_data.json');

    // ---------------------------------------------------------
    // CREATE - UPDATE - DELETE Cart
    // ---------------------------------------------------------

    test('POST - Create, PUT - Update, DELETE - Delete Cart @master @regression @api @end-to-end', async ({ request }) => {

        const createPayload = {
            userId: USER_ID,
            ...TEST_DATA.cart,
        };
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: createPayload,
        });

        expect(createResponse.status(), 'Create cart should return HTTP 201').toBe(201);
        const created = await createResponse.json();
        expect(created.id, 'Created cart should have an ID').toBeTruthy();
        expect(created.userId, 'Created cart should contain the submitted user ID').toBe(USER_ID);
        expect(created.products, 'Created cart should contain the submitted products').toEqual(createPayload.products);
        const cartId = Number(created.id);
        expect(Number.isInteger(cartId), 'Created cart ID should be an integer').toBeTruthy();

        await test.step('Update the created cart quantity', async () => {
            const updatePayload = {
                userId: created.userId,
                date: created.date,
                products: created.products.map(
                    (product: { productId: number; quantity: number }, index: number) => ({
                        ...product,
                        quantity: index === 0 ? product.quantity + 1 : product.quantity,
                    })
                ),
            };
            const updateUrl = `${BASE_URL}${Routes.UPDATE_CART.replace('{id}', String(cartId))}`;
            const updateResponse = await request.put(updateUrl, { data: updatePayload });

            expect(updateResponse.status(), 'Update cart should return HTTP 200').toBe(200);
            const updated = await updateResponse.json();
            expect(updated.id, 'Updated cart ID should match the created ID').toBe(cartId);
            expect(updated.products[0].quantity, 'Updated cart should reflect the increased quantity')
                .toBe(updatePayload.products[0].quantity);
        });

        await test.step('Delete the created cart', async () => {
            const deleteUrl = `${BASE_URL}${Routes.DELETE_CART.replace('{id}', String(cartId))}`;
            const deleteResponse = await request.delete(deleteUrl);

            expect(deleteResponse.status(), 'Delete cart should return HTTP 200').toBe(200);
        });
    });
});
