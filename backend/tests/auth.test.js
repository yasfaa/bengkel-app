const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('🔐 Authentication & RBAC Authorization Integration Tests', () => {
  let adminToken = '';
  let adminCookie = '';
  let kepalaToken = '';
  let asepToken = '';
  const testServiceIds = [];

  afterAll(async () => {
    if (testServiceIds.length > 0) {
      await prisma.serviceQC.deleteMany({ where: { service_id: { in: testServiceIds } } });
      await prisma.serviceItem.deleteMany({ where: { service_id: { in: testServiceIds } } });
      await prisma.service.deleteMany({ where: { id: { in: testServiceIds } } });
    }
    await prisma.$disconnect();
  });

  beforeAll(async () => {
    // 1. Login as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.data).toHaveProperty('accessToken');
    expect(adminRes.body.data.user.role).toBe('ADMIN');
    adminToken = adminRes.body.data.accessToken;
    adminCookie = adminRes.headers['set-cookie'];

    // 2. Login as Kepala Bengkel
    const kepalaRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'kepala', password: 'kepala123' });

    expect(kepalaRes.statusCode).toBe(200);
    expect(kepalaRes.body.data.user.role).toBe('KEPALA_BENGKEL');
    kepalaToken = kepalaRes.body.data.accessToken;

    // 3. Login as Mekanik (Asep)
    const asepRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'asep', password: 'asep123' });

    expect(asepRes.statusCode).toBe(200);
    expect(asepRes.body.data.user.role).toBe('MEKANIK');
    asepToken = asepRes.body.data.accessToken;
  });

  describe('1. Authentication Flow', () => {
    it('1.1 should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('1.2 should get user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('admin');
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('1.3 should reject access to /api/auth/me without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('1.4 should rotate refresh token and issue new 5-minute access token', async () => {
      const res = await request(app).post('/api/auth/refresh').set('Cookie', adminCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('1.5 should logout and invalidate refresh token', async () => {
      const res = await request(app).post('/api/auth/logout').set('Cookie', adminCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('2. Role-Based Access Control (RBAC)', () => {
    it('2.1 should allow KEPALA_BENGKEL to access user management endpoint', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${kepalaToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2.2 should forbid ADMIN from accessing user management endpoint (403 Forbidden)', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('2.3 should forbid MEKANIK from accessing user management endpoint (403 Forbidden)', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${asepToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('2.4 should allow KEPALA_BENGKEL to create and toggle a user account', async () => {
      const testUsername = `user_test_${Date.now()}`;
      const createRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${kepalaToken}`)
        .send({
          username: testUsername,
          password: 'password123',
          nama: 'Test User Role',
          email: `${testUsername}@bengkelku.id`,
          role: 'ADMIN',
        });

      expect(createRes.statusCode).toBe(201);
      const createdId = createRes.body.data.id;

      // Toggle status
      const toggleRes = await request(app)
        .patch(`/api/users/${createdId}/toggle-status`)
        .set('Authorization', `Bearer ${kepalaToken}`);

      expect(toggleRes.statusCode).toBe(200);
      expect(toggleRes.body.data.isActive).toBe(false);

      // Clean up
      const delRes = await request(app)
        .delete(`/api/users/${createdId}`)
        .set('Authorization', `Bearer ${kepalaToken}`);

      expect(delRes.statusCode).toBe(200);
    });
  });

  describe('3. Role Data Scoping on /api/services', () => {
    let unassignedServiceId;
    let assignedServiceId;

    beforeAll(async () => {
      // 1. Create an unassigned service
      const unassignedRes = await request(app)
        .post('/api/services')
        .send({
          customerName: 'Pelanggan Unassigned',
          phone: '081233344455',
          nopol: `B${Math.floor(1000 + Math.random() * 9000)}UNA`,
          keluhan: 'Ganti oli rutin',
          brandName: 'Honda',
          typeName: 'Vario 160',
          capacityName: '160 cc',
        });
      expect(unassignedRes.statusCode).toBe(201);
      unassignedServiceId = unassignedRes.body.id;
      testServiceIds.push(unassignedServiceId);

      // 2. Create an assigned service assigned to Asep
      const assignedRes = await request(app)
        .post('/api/services')
        .send({
          customerName: 'Pelanggan Asep',
          phone: '081299988877',
          nopol: `B${Math.floor(1000 + Math.random() * 9000)}ASP`,
          keluhan: 'Suara kasar di CVT',
          mechanicName: 'Asep Hidayat',
          brandName: 'Honda',
          typeName: 'Beat FI',
          capacityName: '110 cc',
        });
      expect(assignedRes.statusCode).toBe(201);
      assignedServiceId = assignedRes.body.id;
      testServiceIds.push(assignedServiceId);
    });

    it('3.1 ADMIN should see both unassigned and assigned services', async () => {
      const res = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const serviceIds = res.body.map((s) => s.id);
      expect(serviceIds).toContain(unassignedServiceId);
      expect(serviceIds).toContain(assignedServiceId);
    });

    it('3.2 MEKANIK (Asep) should ONLY see services assigned to him, and NOT unassigned services', async () => {
      const res = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${asepToken}`);

      expect(res.statusCode).toBe(200);
      const serviceIds = res.body.map((s) => s.id);
      expect(serviceIds).toContain(assignedServiceId);
      expect(serviceIds).not.toContain(unassignedServiceId);
    });

    it('3.3 KEPALA_BENGKEL should see assigned services and NOT unassigned queue services', async () => {
      const res = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${kepalaToken}`);

      expect(res.statusCode).toBe(200);
      const serviceIds = res.body.map((s) => s.id);
      expect(serviceIds).toContain(assignedServiceId);
      expect(serviceIds).not.toContain(unassignedServiceId);
    });
  });

  describe('4. Work Order Technical Tasks RBAC (Parts & Completion)', () => {
    let serviceId;
    let sparepartId;

    beforeAll(async () => {
      // Create service assigned to Asep
      const serviceRes = await request(app)
        .post('/api/services')
        .send({
          customerName: 'Pelanggan RBAC Test',
          phone: '081211112222',
          nopol: `B${Math.floor(1000 + Math.random() * 9000)}RBC`,
          keluhan: 'Ganti kampas rem',
          mechanicName: 'Asep Hidayat',
          brandName: 'Honda',
          typeName: 'Vario 160',
          capacityName: '160 cc',
        });
      serviceId = serviceRes.body.id;
      testServiceIds.push(serviceId);

      // Start working
      await request(app)
        .patch(`/api/services/${serviceId}/status`)
        .set('Authorization', `Bearer ${asepToken}`)
        .send({ status: 'Dikerjakan' });

      // Get a sparepart
      const partsRes = await request(app).get('/api/master/spareparts');
      sparepartId = partsRes.body[0]?.id || 1;
    });

    it('4.1 ADMIN SHOULD be allowed to add service items on behalf of mechanics (201 Created)', async () => {
      const res = await request(app)
        .post(`/api/services/${serviceId}/items`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemType: 'SPAREPART',
          sparepartId,
          quantity: 1,
          catatan: 'Dicatat oleh Admin/SA dari laporan mekanik',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.itemType).toBe('SPAREPART');
    });

    it('4.2 KEPALA_BENGKEL should NOT be allowed to add service items or complete service (403 Forbidden)', async () => {
      const itemRes = await request(app)
        .post(`/api/services/${serviceId}/items`)
        .set('Authorization', `Bearer ${kepalaToken}`)
        .send({
          itemType: 'SPAREPART',
          sparepartId,
          quantity: 1,
        });

      expect(itemRes.statusCode).toBe(403);
      expect(itemRes.body.status).toBe('fail');

      const statusRes = await request(app)
        .patch(`/api/services/${serviceId}/status`)
        .set('Authorization', `Bearer ${kepalaToken}`)
        .send({ status: 'Selesai' });

      expect(statusRes.statusCode).toBe(403);
      expect(statusRes.body.status).toBe('fail');
    });

    it('4.3 ADMIN SHOULD be allowed to complete service (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/services/${serviceId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Selesai' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Selesai');
      expect(res.body.tgl_selesai).toBeDefined();
    });

    it('4.4 MEKANIK (Asep) SHOULD be allowed to add service items and complete service on assigned unit', async () => {
      // Create another service assigned to Asep
      const newServiceRes = await request(app)
        .post('/api/services')
        .send({
          customerName: 'Pelanggan Asep 2',
          phone: '081299990000',
          nopol: `B${Math.floor(1000 + Math.random() * 9000)}AS2`,
          keluhan: 'Ganti busi',
          mechanicName: 'Asep Hidayat',
          brandName: 'Honda',
          typeName: 'Beat FI',
          capacityName: '110 cc',
        });
      const newServiceId = newServiceRes.body.id;
      testServiceIds.push(newServiceId);

      // Start working
      await request(app)
        .patch(`/api/services/${newServiceId}/status`)
        .set('Authorization', `Bearer ${asepToken}`)
        .send({ status: 'Dikerjakan' });

      // 1. Add item
      const itemRes = await request(app)
        .post(`/api/services/${newServiceId}/items`)
        .set('Authorization', `Bearer ${asepToken}`)
        .send({
          itemType: 'SPAREPART',
          sparepartId,
          quantity: 1,
        });

      expect(itemRes.statusCode).toBe(201);

      // 2. Complete service
      const completeRes = await request(app)
        .patch(`/api/services/${newServiceId}/status`)
        .set('Authorization', `Bearer ${asepToken}`)
        .send({ status: 'Selesai' });

      expect(completeRes.statusCode).toBe(200);
      expect(completeRes.body.status).toBe('Selesai');
    });
  });
});
