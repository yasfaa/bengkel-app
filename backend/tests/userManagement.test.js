const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('User Management (RBAC) Integration Tests', () => {
  let kepalaToken;
  let adminToken;
  let createdUserId;

  beforeAll(async () => {
    const kepalaLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'kepala', password: 'kepala123' });
    kepalaToken = kepalaLogin.body.data.accessToken;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.accessToken;
  });

  afterAll(async () => {
    if (createdUserId) {
      await prisma.refreshToken.deleteMany({ where: { user_id: createdUserId } });
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }
  });

  it('1. should reject access to /api/users for non-Kepala Bengkel', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('2. should list all users for Kepala Bengkel', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${kepalaToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('3. should create a new user account with hashed password', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${kepalaToken}`)
      .send({
        username: 'sa_test_user_unique',
        nama: 'SA Test Account',
        email: 'satestunique@bengkelku.id',
        password: 'securePassword123',
        role: 'ADMIN',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.username).toBe('sa_test_user_unique');
    expect(res.body.data.role).toBe('ADMIN');
    expect(res.body.data).not.toHaveProperty('password');
    createdUserId = res.body.data.id;
  });

  it('4. should reject creating duplicate username', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${kepalaToken}`)
      .send({
        username: 'sa_test_user_unique',
        nama: 'Duplicate Account',
        password: 'password123',
        role: 'ADMIN',
      });

    expect([400, 409]).toContain(res.statusCode);
  });

  it('5. should toggle user active status', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/toggle-status`)
      .set('Authorization', `Bearer ${kepalaToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    // Toggle back to active
    const res2 = await request(app)
      .patch(`/api/users/${createdUserId}/toggle-status`)
      .set('Authorization', `Bearer ${kepalaToken}`);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.data.isActive).toBe(true);
  });

  it('6. should delete user account', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${kepalaToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    createdUserId = null;
  });
});
