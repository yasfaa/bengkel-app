const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('API Input Validation Middleware Tests (Zod)', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject invalid service registration payload with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/services')
      .send({
        customerName: 'A', // Too short
        // Missing phone, nopol, keluhan
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('status', 'fail');
    expect(res.body).toHaveProperty('details');
    expect(res.body.details).toHaveProperty('customerName');
    expect(res.body.details).toHaveProperty('phone');
    expect(res.body.details).toHaveProperty('nopol');
    expect(res.body.details).toHaveProperty('keluhan');
  });

  it('should accept valid service registration and create PKB with 201 Created', async () => {
    const uniqueNopol = `B ${Math.floor(1000 + Math.random() * 9000)} TST`;
    const res = await request(app)
      .post('/api/services')
      .send({
        customerName: 'Ahmad Dahlan',
        phone: '081299887766',
        nopol: uniqueNopol,
        keluhan: 'Ganti oli dan tune up mesin',
        brandName: 'Honda',
        typeName: 'Beat',
        capacityName: '110cc',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('nomorPkb');
    expect(res.body.nomorPkb).toMatch(/^PKB-\d{8}-\d{3}$/);
    expect(res.body.status).toBe('Menunggu');
  });

  it('should reject invalid master sparepart payload with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/master/spareparts')
      .send({
        kode_part: 'A', // Too short
        nama: '', // Empty
        harga_jual: -5000, // Negative
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('status', 'fail');
    expect(res.body).toHaveProperty('details');
  });
});
