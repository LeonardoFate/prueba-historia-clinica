const request = require('supertest');
const app = require('../../src/app');

// Mock de la base de datos para tests de integración
jest.mock('../../src/config/database');

describe('Patient Routes Integration', () => {
  test('GET /api/health should return healthy status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'API is healthy');
  });

  test('GET / should return API info', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Patient Management System API');
  });

  test('GET /api/unknown-route should return 404', async () => {
    const response = await request(app)
      .get('/api/unknown-route')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Route not found');
  });
});