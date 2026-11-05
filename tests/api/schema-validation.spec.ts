import { test, expect } from '@playwright/test';
import { DataProvider } from '../../utils/DataReader';
import { Routes } from '../../api/endpoints/routes';
import { getEnvFileEncoding } from '../../utils/envEncoding';
import Ajv from 'ajv';
import dotenv from 'dotenv';

dotenv.config({ encoding: getEnvFileEncoding() });

test.describe('JSON Schema Validation Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const CART_ID = Number(process.env.CART_ID ?? 1);

    const ajv = new Ajv();

    // ---------------------------------------------------------
    // GET - Product Response Schema
    // ---------------------------------------------------------

    test('GET - Product Response Schema @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET product should return HTTP 200').toBe(200);

        const product = await response.json();
        const schema = DataProvider.readJson('./api/schemas/product_api_schema.json');
        const validate = ajv.compile(schema);

        const isValid = validate(product);

        expect(isValid, `Product response should conform to the schema. Errors: ${JSON.stringify(validate.errors)}`)
            .toBeTruthy();
    });

    // ---------------------------------------------------------
    // GET - User Response Schema
    // ---------------------------------------------------------

    test('GET - User Response Schema @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET user should return HTTP 200').toBe(200);

        const user = await response.json();
        const schema = DataProvider.readJson('./api/schemas/user_api_schema.json');
        const validate = ajv.compile(schema);

        const isValid = validate(user);

        expect(isValid, `User response should conform to the schema. Errors: ${JSON.stringify(validate.errors)}`)
            .toBeTruthy();
    });

    // ---------------------------------------------------------
    // GET - Cart Response Schema
    // ---------------------------------------------------------

    test('GET - Cart Response Schema @master @sanity @api', async ({ request }) => {

        const url = `${BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID))}`;

        const response = await request.get(url);

        expect(response.status(), 'GET cart should return HTTP 200').toBe(200);

        const cart = await response.json();
        const schema = DataProvider.readJson('./api/schemas/cart_api_schema.json');
        const validate = ajv.compile(schema);

        const isValid = validate(cart);

        expect(isValid, `Cart response should conform to the schema. Errors: ${JSON.stringify(validate.errors)}`)
            .toBeTruthy();
    });
});
