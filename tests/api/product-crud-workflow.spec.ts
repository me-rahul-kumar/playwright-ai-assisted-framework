import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('Product CRUD Workflow', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const TEST_DATA = DataProvider.readJson('./testdata/fakestore_api_data.json');

    // ---------------------------------------------------------
    // CREATE - UPDATE - DELETE Product
    // ---------------------------------------------------------

    test('POST - Create, PUT - Update, DELETE - Delete Product @master @regression @api @end-to-end', async ({ request }) => {

        const createPayload = TEST_DATA.product;
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: createPayload,
        });

        expect(createResponse.status(), 'Create product should return HTTP 201').toBe(201);
        const created = await createResponse.json();
        expect(created.id, 'Created product should have an ID').toBeTruthy();
        expect(created.title, 'Created product should match the submitted title').toBe(createPayload.title);
        const productId = Number(created.id);
        expect(Number.isInteger(productId), 'Created product ID should be an integer').toBeTruthy();

        await test.step('Update the created product', async () => {
            const updatePayload = TEST_DATA.updatedProduct;
            const updateUrl = `${BASE_URL}${Routes.UPDATE_PRODUCT.replace('{id}', String(productId))}`;
            const updateResponse = await request.put(updateUrl, { data: updatePayload });

            expect(updateResponse.status(), 'Update product should return HTTP 200').toBe(200);
            const updated = await updateResponse.json();
            expect(updated.id, 'Updated product ID should match the created ID').toBe(productId);
            expect(updated.title, 'Updated product should contain the updated title').toBe(updatePayload.title);
            expect(updated.price, 'Updated product should contain the updated price').toBe(updatePayload.price);
        });

        await test.step('Delete the created product', async () => {
            const deleteUrl = `${BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(productId))}`;
            const deleteResponse = await request.delete(deleteUrl);

            expect(deleteResponse.status(), 'Delete product should return HTTP 200').toBe(200);
        });
    });
});
