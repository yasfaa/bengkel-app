const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Master Data API Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fetch master services catalog', async () => {
    const res = await request(app).get('/api/master/services');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch master spareparts list', async () => {
    const res = await request(app).get('/api/master/spareparts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('kode_part');
      expect(res.body[0]).toHaveProperty('stok');
    }
  });

  it('should fetch mechanics list', async () => {
    const res = await request(app).get('/api/mechanics');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
