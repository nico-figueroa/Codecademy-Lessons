import request from 'supertest';
import app from '../app.js';

let customerToken;
let orderId;

beforeAll(async () => {
  const login = await request(app)
    .post('/auth/login')
    .send({
      email: 'customer@example.com',
      password: 'Password123!'
    });

  customerToken = login.body.accessToken;

  // Add item to cart
  const products = await request(app).get('/products');
  const productId = products.body[0].id;

  await request(app)
    .post('/carts/me/items')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ productId, quantity: 1 });

  // Place order
  const orderRes = await request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${customerToken}`);

  orderId = orderRes.body.id;
});

describe('Payments API', () => {
  test('Customer can create a payment', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        provider: 'testpay',
        dummyToken: 'xyz123'
      });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toBe(orderId);
  });

  test('Customer can retrieve payment', async () => {
    const paymentList = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    const paymentId = paymentList.body.paymentReference;

    const res = await request(app)
      .get(`/payments/${paymentId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(paymentId);
  });
});
