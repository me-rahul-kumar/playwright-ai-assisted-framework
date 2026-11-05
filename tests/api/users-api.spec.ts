import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('Users API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const TEST_DATA = DataProvider.readJson('./testdata/fakestore_api_data.json');

    // ---------------------------------------------------------
    // GET - All Users
    // ---------------------------------------------------------

    test('GET - All Users @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);

        expect(response.status(), 'GET all users should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        expect(responseBody.length, 'User array should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - User by ID
    // ---------------------------------------------------------

    test('GET - User by ID @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET user by ID should return HTTP 200').toBe(200);

        const user = await response.json();

        expect(user.id, 'Returned user ID should match the requested ID').toBe(USER_ID);
    });

    // ---------------------------------------------------------
    // GET - Users with Limit
    // ---------------------------------------------------------

    test('GET - Users with Limit @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(LIMIT))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET users with limit should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();
        expect(responseBody.length, `Should return exactly ${LIMIT} users`).toBe(LIMIT);
    });

    // ---------------------------------------------------------
    // GET - Sort Users Ascending
    // ---------------------------------------------------------

    test('GET - Sort Users Ascending @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_USERS_SORTED.replace('{order}', 'asc')}`;

        const response = await request.get(url);

        expect(response.status(), 'GET sorted users (asc) should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        const ids = responseBody.map((user: { id: number }) => user.id);
        const sortedIds = [...ids].sort((a, b) => a - b);

        expect(ids, 'User IDs should be in ascending order').toEqual(sortedIds);
    });

    // ---------------------------------------------------------
    // GET - Sort Users Descending
    // ---------------------------------------------------------

    test('GET - Sort Users Descending @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_USERS_SORTED.replace('{order}', 'desc')}`;

        const response = await request.get(url);

        expect(response.status(), 'GET sorted users (desc) should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response should be an array').toBeTruthy();

        const ids = responseBody.map((user: { id: number }) => user.id);
        const sortedIds = [...ids].sort((a, b) => b - a);

        expect(ids, 'User IDs should be in descending order').toEqual(sortedIds);
    });

    // ---------------------------------------------------------
    // POST - Create User
    // ---------------------------------------------------------

    test('POST - Create User @master @regression @api', async ({ request }) => {

        const payload = TEST_DATA.user;

        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: payload,
        });

        expect(response.status(), 'Create user should return HTTP 201').toBe(201);

        const created = await response.json();

        expect(Number.isInteger(created.id), 'Created user should return an integer ID').toBeTruthy();
    });

    // ---------------------------------------------------------
    // PUT - Update User
    // ---------------------------------------------------------

    test('PUT - Update User @master @regression @api', async ({ request }) => {

        const payload = TEST_DATA.updatedUser;
        const url = `${BASE_URL}${Routes.UPDATE_USER.replace('{id}', String(USER_ID))}`;

        const response = await request.put(url, {
            data: payload,
        });

        expect(response.status(), 'Update user should return HTTP 200').toBe(200);

        const updated = await response.json();

        expect(updated.username, 'Updated user should contain the updated username').toBe(payload.username);
        expect(updated.email, 'Updated user should contain the updated email').toBe(payload.email);
    });

    // ---------------------------------------------------------
    // DELETE - Delete User
    // ---------------------------------------------------------

    test('DELETE - Delete User @master @regression @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.DELETE_USER.replace('{id}', String(USER_ID))}`;

        const response = await request.delete(url);

        expect(response.status(), 'Delete user should return HTTP 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Delete response should identify the deleted user').toBe(USER_ID);
    });
});
