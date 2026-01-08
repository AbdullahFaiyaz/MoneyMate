const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

/**
 * Unit Tests for Finance Management Features
 * Student ID: 24241359
 * Feature: FR-5 Recurring Transactions
 */

describe('Feature: Recurring Transactions (ID: 24241359)', () => {
    let authToken = '';
    let createdTransactionId = '';

    // PRE-CONDITION: Dynamic Auth
    beforeAll(async () => {
        // Silence expected console errors from negative tests for a cleaner screenshot
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Wait for DB connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create fresh user for dynamic auth programmatically
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Member',
                email: `test${Date.now()}@example.com`,
                password: 'Test@123456'
            });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: registerRes.body.email,
                password: 'Test@123456'
            });

        authToken = loginRes.body.token;
    });

    afterAll(async () => {
        if (createdTransactionId) {
            await request(app)
                .delete(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${authToken}`);
        }
        jest.restoreAllMocks();
        await mongoose.connection.close();
    });

    // TEST 1: Create Recurring Transaction
    it('should create a new monthly recurring transaction', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                text: 'Monthly Rent',
                amount: 500.00,
                type: 'expense',
                category: 'Rent',
                isRecurring: true,
                recurrenceInterval: 'monthly'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data.isRecurring).toBe(true);
        expect(res.body.data.recurrenceInterval).toBe('monthly');

        createdTransactionId = res.body.data._id;
    });

    // TEST 2: Validation Failure (Missing Interval)
    it('should return 400 if recurrence interval is missing', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                text: 'Missing Interval',
                amount: 10.00,
                type: 'expense',
                isRecurring: true
            });

        expect(res.statusCode).toEqual(400);
    });

    // TEST 3: Validation Failure (Invalid Interval Value)
    it('should return 400 if recurrence interval is invalid', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                text: 'Invalid Interval',
                amount: 10.00,
                type: 'expense',
                isRecurring: true,
                recurrenceInterval: 'invalid_interval'
            });

        expect(res.statusCode).toEqual(400);
    });

    // TEST 4: Read Operation (Filter Recurring)
    it('should retrieve list of all recurring transactions', async () => {
        const res = await request(app)
            .get('/api/transactions?isRecurring=true')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBeInstanceOf(Array);
        res.body.data.forEach(tx => {
            expect(tx.isRecurring).toBe(true);
        });
    });

    // TEST 5: Update Operation
    it('should update the recurrence interval of an existing transaction', async () => {
        const res = await request(app)
            .put(`/api/transactions/${createdTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                recurrenceInterval: 'yearly'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.recurrenceInterval).toBe('yearly');
    });

    // TEST 6: Delete Operation
    it('should delete a specific recurring transaction', async () => {
        const res = await request(app)
            .delete(`/api/transactions/${createdTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);

        // Verify deletion (Expect 404 or empty as per controller logic)
        const check = await request(app)
            .get(`/api/transactions/${createdTransactionId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(check.statusCode).not.toBe(200);

        createdTransactionId = '';
    });

    // TEST 7: Security (Missing Auth Token)
    it('should return 401 when creating without authorization', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .send({
                text: 'No Token',
                amount: 50,
                type: 'expense',
                isRecurring: true,
                recurrenceInterval: 'monthly'
            });

        expect(res.statusCode).toBe(401);
    });

    // TEST 8: Logically Verified Date Generation
    it('should correctly set the nextRunDate for daily recurrence', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                text: 'Daily Coffee',
                amount: 5.00,
                type: 'expense',
                isRecurring: true,
                recurrenceInterval: 'daily'
            });

        expect(res.statusCode).toEqual(201);
        const nextRun = new Date(res.body.data.nextRunDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        expect(nextRun.getDate()).toBe(tomorrow.getDate());
    });
});
