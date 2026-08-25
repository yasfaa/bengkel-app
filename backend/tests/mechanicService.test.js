const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Mechanic Management & Workload Service Tests', () => {
  let adminToken;
  let kepalaToken;
  let createdMechId;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;

    const kepalaLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'kepala', password: 'kepala123' });
    kepalaToken = kepalaLogin.body.data.accessToken;
  });

  afterAll(async () => {
    if (createdMechId) {
      await prisma.mechanic.deleteMany({ where: { id: createdMechId } });
    }
  });

  it('1. should list all active mechanics with workload metadata', async () => {
    const res = await request(app)
      .get('/api/mechanics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nama');
    expect(res.body[0]).toHaveProperty('spesialisasi');
  });

  it('2. should allow creating a new Mechanic', async () => {
    const res = await request(app)
      .post('/api/mechanics')
      .set('Authorization', `Bearer ${kepalaToken}`)
      .send({
        nama: 'Dedi Kusnandar Test',
        spesialisasi: 'Suspensi & Pengereman',
        waktu_kerja: 'Full-time (08:00 - 17:00)',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.nama).toBe('Dedi Kusnandar Test');
    expect(res.body.spesialisasi).toBe('Suspensi & Pengereman');
    createdMechId = res.body.id;
  });

  it('3. should allow updating mechanic profile', async () => {
    const res = await request(app)
      .patch(`/api/mechanics/${createdMechId}`)
      .set('Authorization', `Bearer ${kepalaToken}`)
      .send({
        spesialisasi: 'Master Engine & Dyno Tune',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.spesialisasi).toBe('Master Engine & Dyno Tune');
  });

  it('4. should delete mechanic and return 204', async () => {
    const res = await request(app)
      .delete(`/api/mechanics/${createdMechId}`)
      .set('Authorization', `Bearer ${kepalaToken}`);

    expect(res.statusCode).toBe(204);
    createdMechId = null;
  });
});
