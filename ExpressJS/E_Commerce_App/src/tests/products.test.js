import request from 'supertest';
import app from '../app.js';

let adminToken;

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'Password123!'
    });

  adminToken = res.body.accessToken;
});

describe('Products API', () => {
  test('List products', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Admin can create a product', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'Test Desc',
        price: 10.99,
        currency: 'USD',
        stock: 5
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });

  test('Admin can update a product', async () => {
    const list = await request(app).get('/products');
    const productId = list.body[0].id;

    const res = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 999 });

    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(999);
  });
});
