import { test, expect } from '@playwright/test';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import dotenv from 'dotenv';

const loadedEnvironment = dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('Authentication API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USERNAME = loadedEnvironment.parsed?.USERNAME || process.env.USERNAME;
    const PASSWORD = loadedEnvironment.parsed?.PASSWORD || process.env.PASSWORD;

    // ---------------------------------------------------------
    // POST - Successful Login
    // ---------------------------------------------------------

    test('POST - Successful Login @master @sanity @api', async ({ request }) => {

        expect(USERNAME, 'Set USERNAME in .env to run the successful-login test').toBeTruthy();
        expect(PASSWORD, 'Set PASSWORD in .env to run the successful-login test').toBeTruthy();

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: USERNAME,
                password: PASSWORD,
            },
        });

        expect(response.status(), 'Login should return HTTP 201').toBe(201);

        const responseBody = await response.json();

        expect(responseBody.token, 'Token should exist in the response').toBeTruthy();
        expect(typeof responseBody.token, 'Token should be a string').toBe('string');
        expect(responseBody.token.length, 'Token should be a non-empty string').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // POST - Invalid Login
    // ---------------------------------------------------------

    test('POST - Invalid Login @master @sanity @api', async ({ request }) => {

        const invalidPayload = RandomDataUtil.generateInvalidLoginPayload();

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: invalidPayload,
        });

        expect(response.status(), 'Invalid login should return HTTP 401').toBe(401);

        const responseBody = await response.text();

        expect(responseBody, 'Error message should match the expected text')
            .toBe('username or password is incorrect');
    });
});
