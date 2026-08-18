const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('GET /api/health - Health & Readiness Probe', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 200 OK and database health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});
