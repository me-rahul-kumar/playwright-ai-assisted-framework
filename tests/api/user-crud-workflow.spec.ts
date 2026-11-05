import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('User CRUD Workflow', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const TEST_DATA = DataProvider.readJson('./testdata/fakestore_api_data.json');

    // ---------------------------------------------------------
    // CREATE - UPDATE - DELETE User
    // ---------------------------------------------------------

    test('POST - Create, PUT - Update, DELETE - Delete User @master @regression @api @end-to-end', async ({ request }) => {

        const createPayload = TEST_DATA.user;
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: createPayload,
        });

        expect(createResponse.status(), 'Create user should return HTTP 201').toBe(201);
        const created = await createResponse.json();
        expect(Number.isInteger(created.id), 'Created user should return an integer ID').toBeTruthy();
        const userId = Number(created.id);
        expect(Number.isInteger(userId), 'Created user ID should be an integer').toBeTruthy();

        await test.step('Update the created user', async () => {
            const updatePayload = TEST_DATA.updatedUser;
            const updateUrl = `${BASE_URL}${Routes.UPDATE_USER.replace('{id}', String(userId))}`;
            const updateResponse = await request.put(updateUrl, { data: updatePayload });

            expect(updateResponse.status(), 'Update user should return HTTP 200').toBe(200);
            const updated = await updateResponse.json();
            expect(updated.username, 'Updated user should contain the updated username').toBe(updatePayload.username);
            expect(updated.email, 'Updated user should contain the updated email').toBe(updatePayload.email);
        });

        await test.step('Delete the created user', async () => {
            const deleteUrl = `${BASE_URL}${Routes.DELETE_USER.replace('{id}', String(userId))}`;
            const deleteResponse = await request.delete(deleteUrl);

            expect(deleteResponse.status(), 'Delete user should return HTTP 200').toBe(200);
        });
    });
});
