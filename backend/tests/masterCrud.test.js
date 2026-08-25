const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Master Data Full CRUD Integration Tests', () => {
  let adminToken;
  let createdBrandId;
  let createdTypeId;
  let createdCapacityId;
  let createdSupplierId;
  let createdServiceId;
  let createdPartId;

  beforeAll(async () => {
    // Login as Admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup created test records in order
    if (createdPartId) await prisma.sparepart.deleteMany({ where: { id: createdPartId } });
    if (createdServiceId)
      await prisma.serviceMaster.deleteMany({ where: { id: createdServiceId } });
    if (createdTypeId) await prisma.motorType.deleteMany({ where: { id: createdTypeId } });
    if (createdBrandId) await prisma.motorBrand.deleteMany({ where: { id: createdBrandId } });
    if (createdCapacityId)
      await prisma.engineCapacity.deleteMany({ where: { id: createdCapacityId } });
    if (createdSupplierId) await prisma.supplier.deleteMany({ where: { id: createdSupplierId } });
  });

  /* =========================================================================
     1. ServiceMaster CRUD
     ========================================================================= */
  describe('ServiceMaster Catalog', () => {
    it('1. should create a new ServiceMaster item', async () => {
      const res = await request(app)
        .post('/api/master/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Servis Injeksi & Throttle Body Test',
          harga: 85000,
          deskripsi: 'Pembersihan injector dan kalibrasi sensor TPS',
          estimasi_durasi: 45,
          kategori: 'SEDANG',
          is_active: true,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.nama).toBe('Servis Injeksi & Throttle Body Test');
      expect(res.body.harga).toBe(85000);
      createdServiceId = res.body.id;
    });

    it('2. should get ServiceMaster by ID', async () => {
      const res = await request(app).get(`/api/master/services/${createdServiceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(createdServiceId);
      expect(res.body.harga).toBe(85000);
    });

    it('3. should update ServiceMaster item', async () => {
      const res = await request(app)
        .patch(`/api/master/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          harga: 95000,
          deskripsi: 'Updated deskripsi pembersihan injector',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.harga).toBe(95000);
      expect(res.body.deskripsi).toBe('Updated deskripsi pembersihan injector');
    });

    it('4. should delete ServiceMaster item and return 204', async () => {
      const res = await request(app)
        .delete(`/api/master/services/${createdServiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      const check = await request(app).get(`/api/master/services/${createdServiceId}`);
      expect(check.statusCode).toBe(404);
      createdServiceId = null;
    });
  });

  /* =========================================================================
     2. Motor Brands & Types
     ========================================================================= */
  describe('Motor Brand & Type Catalog', () => {
    it('1. should create a new Motor Brand', async () => {
      const res = await request(app)
        .post('/api/master/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nama: 'Kawasaki Test' });

      expect(res.statusCode).toBe(201);
      expect(res.body.nama).toBe('Kawasaki Test');
      createdBrandId = res.body.id;
    });

    it('2. should create a new Motor Type linked to the Brand', async () => {
      const res = await request(app)
        .post('/api/master/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Ninja ZX-25R Test',
          brand_id: createdBrandId,
          jenis: 'sport',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.nama).toBe('Ninja ZX-25R Test');
      expect(res.body.brand_id).toBe(createdBrandId);
      createdTypeId = res.body.id;
    });

    it('3. should fetch motor types filtered by brandId', async () => {
      const res = await request(app).get(`/api/master/types?brandId=${createdBrandId}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t) => t.id === createdTypeId)).toBe(true);
    });

    it('4. should update and delete Motor Type and Brand', async () => {
      const patchRes = await request(app)
        .patch(`/api/master/types/${createdTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nama: 'Ninja ZX-25RR Updated' });
      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.body.nama).toBe('Ninja ZX-25RR Updated');

      const delTypeRes = await request(app)
        .delete(`/api/master/types/${createdTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delTypeRes.statusCode).toBe(204);
      createdTypeId = null;

      const delBrandRes = await request(app)
        .delete(`/api/master/brands/${createdBrandId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delBrandRes.statusCode).toBe(204);
      createdBrandId = null;
    });
  });

  /* =========================================================================
     3. Engine Capacities CRUD
     ========================================================================= */
  describe('Engine Capacity Catalog', () => {
    it('1. should create, update, and delete Engine Capacity', async () => {
      const createRes = await request(app)
        .post('/api/master/capacities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ kapasitas: '999 cc' });
      expect(createRes.statusCode).toBe(201);
      createdCapacityId = createRes.body.id;

      const patchRes = await request(app)
        .patch(`/api/master/capacities/${createdCapacityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ kapasitas: '1000 cc' });
      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.body.kapasitas).toBe('1000 cc');

      const delRes = await request(app)
        .delete(`/api/master/capacities/${createdCapacityId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delRes.statusCode).toBe(204);
      createdCapacityId = null;
    });
  });

  /* =========================================================================
     4. Suppliers & Spareparts CRUD
     ========================================================================= */
  describe('Supplier & Sparepart Catalog', () => {
    it('1. should create a Supplier', async () => {
      const res = await request(app)
        .post('/api/master/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'PT Daya Adicipta Motora Test',
          telepon: '022-1234567',
          alamat: 'Jl. Raya Cibeureum No. 26',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.nama).toBe('PT Daya Adicipta Motora Test');
      createdSupplierId = res.body.id;
    });

    it('2. should create a Sparepart linked to Supplier', async () => {
      const res = await request(app)
        .post('/api/master/spareparts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kode_part: 'TEST-BELT-001',
          nama: 'Drive Belt Bando Test',
          kategori: 'MEDIUM_MOVING',
          stok: 25,
          min_stok: 5,
          harga_beli: 75000,
          harga_jual: 110000,
          supplier_id: createdSupplierId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.kode_part).toBe('TEST-BELT-001');
      expect(res.body.stok).toBe(25);
      expect(res.body.harga_jual).toBe(110000);
      createdPartId = res.body.id;
    });

    it('3. should fetch sparepart details by ID', async () => {
      const res = await request(app).get(`/api/master/spareparts/${createdPartId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.kode_part).toBe('TEST-BELT-001');
      expect(res.body.supplier).toBe('PT Daya Adicipta Motora Test');
    });

    it('4. should update and delete Sparepart and Supplier', async () => {
      const patchPartRes = await request(app)
        .patch(`/api/master/spareparts/${createdPartId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stok: 30, harga_jual: 120000 });
      expect(patchPartRes.statusCode).toBe(200);
      expect(patchPartRes.body.stok).toBe(30);

      const delPartRes = await request(app)
        .delete(`/api/master/spareparts/${createdPartId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delPartRes.statusCode).toBe(204);
      createdPartId = null;

      const delSupRes = await request(app)
        .delete(`/api/master/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delSupRes.statusCode).toBe(204);
      createdSupplierId = null;
    });
  });
});
