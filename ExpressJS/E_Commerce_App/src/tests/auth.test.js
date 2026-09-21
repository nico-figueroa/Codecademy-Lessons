import request from 'supertest';
import app from '../app.js';

describe('Auth API', () => {
  test('Login works for seeded admin', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test('Registration creates a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('newuser@example.com');
  });
});
