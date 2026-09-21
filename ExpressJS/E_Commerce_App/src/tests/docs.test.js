import request from 'supertest';
import app from '../app.js';

describe('API documentation', () => {
  test('serves the OpenAPI document', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
    expect(res.body.info.title).toBe('Generic E-commerce API');
    expect(res.body.paths['/openapi.json']).toBeDefined();
    expect(res.body.paths['/api-docs/']).toBeDefined();
  });

  test('serves Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('Mercantile API Documentation');
  });
});