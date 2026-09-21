import request from 'supertest';
import app from '../app.js';

let customerToken;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({
      email: 'customer@example.com',
      password: 'Password123!'
    });

  customerToken = res.body.accessToken;

  // Add item to cart so order can be placed
  const products = await request(app).get('/products');
  const productId = products.body[0].id;

  await request(app)
    .post('/carts/me/items')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ productId, quantity: 1 });
});

describe('Orders API', () => {
  test('Customer can place an order', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  test('Customer can list their orders', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
