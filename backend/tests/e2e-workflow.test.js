const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('🚀 End-to-End (E2E) Workshop Operational Lifecycle Integration Test', () => {
  let createdServiceId = null;
  let generatedNomorPkb = null;
  let testMechanicName = null;

  beforeAll(async () => {
    let mechanic = await prisma.mechanic.findFirst({ where: { is_active: true } });
    if (!mechanic) {
      mechanic = await prisma.mechanic.create({
        data: {
          nama: 'Asep',
          tgl_lahir: new Date('1995-05-15'),
          waktu_kerja: 'Full-time',
          spesialisasi: 'Mesin & CVT',
          is_active: true,
        },
      });
    }
    testMechanicName = mechanic.nama;
  });

  afterAll(async () => {
    if (createdServiceId) {
      await prisma.serviceQC.deleteMany({ where: { service_id: createdServiceId } });
      await prisma.serviceItem.deleteMany({ where: { service_id: createdServiceId } });
      await prisma.service.deleteMany({ where: { id: createdServiceId } });
    }
    await prisma.$disconnect();
  });

  describe('Stage 1: System Readiness & Master Data Catalog', () => {
    it('1.1 Health Probe - should verify API server and database are healthy', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('uptime');
    });

    it('1.2 Master Catalogs - should fetch motor brands, types, services, spareparts, and mechanics', async () => {
      const [resBrands, resServices, resSpareparts, resMechanics] = await Promise.all([
        request(app).get('/api/master/brands'),
        request(app).get('/api/master/services'),
        request(app).get('/api/master/spareparts'),
        request(app).get('/api/mechanics'),
      ]);

      expect(resBrands.statusCode).toBe(200);
      expect(Array.isArray(resBrands.body)).toBe(true);

      expect(resServices.statusCode).toBe(200);
      expect(Array.isArray(resServices.body)).toBe(true);

      expect(resSpareparts.statusCode).toBe(200);
      expect(Array.isArray(resSpareparts.body)).toBe(true);

      expect(resMechanics.statusCode).toBe(200);
      expect(Array.isArray(resMechanics.body)).toBe(true);

      if (resMechanics.body.length > 0) {
        testMechanicName = resMechanics.body[0].nama;
      }
    });
  });

  describe('Stage 2: Customer Registration & PKB Reception (Service Advisor)', () => {
    it('2.1 should reject invalid registration payload with 400 Bad Request', async () => {
      const res = await request(app).post('/api/services').send({
        customerName: '',
        phone: '123',
        nopol: '',
        keluhan: '',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('2.2 should register new vehicle service and generate official PKB number', async () => {
      const uniqueNopol = `B ${Math.floor(1000 + Math.random() * 8999)} E2E`;
      const uniquePhone = `0812${Math.floor(10000000 + Math.random() * 89999999)}`;

      const payload = {
        customerName: 'Bambang Sudiro',
        phone: uniquePhone,
        nopol: uniqueNopol,
        brandName: 'Honda',
        typeName: 'Vario 160',
        capacityName: '160cc',
        warna: 'Hitam Doff',
        tahunPembuatan: 2023,
        kmMasuk: 12500,
        levelBensin: 'Full',
        catatanKondisi: 'Bodi mulus, spion lengkap kanan-kiri',
        keluhan: 'Servis berkala 10.000 KM dan ganti oli gardan',
        estimasiBiaya: 150000,
      };

      const res = await request(app).post('/api/services').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nomorPkb');
      expect(res.body.nomorPkb).toMatch(/^PKB-\d{8}-\d{3}$/);
      expect(res.body.nopol).toBe(uniqueNopol);
      expect(res.body.customerName).toBe('Bambang Sudiro');
      expect(res.body.status).toBe('Menunggu');

      createdServiceId = res.body.id;
      generatedNomorPkb = res.body.nomorPkb;
    });
  });

  describe('Stage 3: Pit Allocation & Mechanic Assignment', () => {
    it('3.1 should reject transitioning to "Dikerjakan" without an assigned mechanic', async () => {
      if (!createdServiceId) return;

      const res = await request(app)
        .patch(`/api/services/${createdServiceId}/status`)
        .send({ status: 'Dikerjakan' });

      expect(res.statusCode).toBe(400);
    });

    it('3.2 should successfully assign mechanic and transition status to "Dikerjakan"', async () => {
      if (!createdServiceId) return;

      const mechanicToAssign = testMechanicName || 'Asep';
      const res = await request(app).patch(`/api/services/${createdServiceId}/status`).send({
        status: 'Dikerjakan',
        mechanicName: mechanicToAssign,
        allowBusyOverride: true,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdServiceId);
      expect(res.body.status).toBe('Dikerjakan');
      expect(res.body.mechanicName).toBe(mechanicToAssign);
    });
  });

  describe('Stage 4: Work Order Completion & Queue Verification', () => {
    it('4.1 should transition work order status to "Selesai" with completion timestamp', async () => {
      if (!createdServiceId) return;

      const res = await request(app)
        .patch(`/api/services/${createdServiceId}/status`)
        .send({ status: 'Selesai' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Selesai');
      expect(res.body).toHaveProperty('tgl_selesai');
      expect(res.body.tgl_selesai).not.toBeNull();
    });

    it('4.2 should list all services and verify the completed PKB', async () => {
      const res = await request(app).get('/api/services');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const target = res.body.find((s) => s.id === createdServiceId);
      if (target) {
        expect(target.nomorPkb).toBe(generatedNomorPkb);
        expect(target.status).toBe('Selesai');
      }
    });
  });
});
