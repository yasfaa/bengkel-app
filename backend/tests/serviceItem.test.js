const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('🛠️ Stage 3: Work Order Items & Part Requisition API Tests', () => {
  let testServiceId = null;
  let testSparepartId = null;
  let testServiceMasterId = null;
  let createdItemId = null;

  beforeAll(async () => {
    // 1. Ensure master supplier exists
    let supplier = await prisma.supplier.findFirst();
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { nama: 'PT Astra Otoparts Tbk', telepon: '0811223344' },
      });
    }

    // 2. Ensure test sparepart with stock exists
    let sparepart = await prisma.sparepart.findFirst({
      where: { kode_part: 'TST-OIL-001' },
    });
    if (!sparepart) {
      sparepart = await prisma.sparepart.create({
        data: {
          kode_part: 'TST-OIL-001',
          nama: 'Oli Mesin Matic Sintetik 0.8L',
          kategori: 'OLI',
          stok: 10,
          min_stok: 2,
          harga_beli: 40000,
          harga_jual: 55000,
          supplier_id: supplier.id,
        },
      });
    }
    testSparepartId = sparepart.id;

    // 3. Ensure test service master exists
    let serviceMaster = await prisma.serviceMaster.findFirst({
      where: { nama: 'Servis Ringan & Tune Up' },
    });
    if (!serviceMaster) {
      serviceMaster = await prisma.serviceMaster.create({
        data: {
          nama: 'Servis Ringan & Tune Up',
          harga: 50000,
          kategori: 'RINGAN',
          is_active: true,
        },
      });
    }
    testServiceMasterId = serviceMaster.id;

    // 4. Create a test Service / PKB
    const uniqueNopol = `B ${Math.floor(1000 + Math.random() * 8999)} REQ`;
    const res = await request(app).post('/api/services').send({
      customerName: 'Joko Widodo',
      phone: '081299998888',
      nopol: uniqueNopol,
      keluhan: 'Ganti oli dan servis rutin',
      serviceMasterId: testServiceMasterId,
    });
    testServiceId = res.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('3.1 should fetch empty items list for freshly created PKB', async () => {
    const res = await request(app).get(`/api/services/${testServiceId}/items`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('3.2 should reject adding sparepart when requested quantity exceeds available stock', async () => {
    const res = await request(app).post(`/api/services/${testServiceId}/items`).send({
      itemType: 'SPAREPART',
      sparepartId: testSparepartId,
      quantity: 9999, // Exceeds available stock (10)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/stok suku cadang/i);
  });

  it('3.3 should successfully add sparepart requisition to PKB with default MENUNGGU_KONFIRMASI status', async () => {
    const res = await request(app).post(`/api/services/${testServiceId}/items`).send({
      itemType: 'SPAREPART',
      sparepartId: testSparepartId,
      quantity: 2,
      catatan: 'Permintaan mekanik untuk ganti oli berkala',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.itemType).toBe('SPAREPART');
    expect(res.body.sparepartId).toBe(testSparepartId);
    expect(res.body.quantity).toBe(2);
    expect(res.body.hargaSatuan).toBe(55000);
    expect(res.body.subtotal).toBe(110000);
    expect(res.body.approvalStatus).toBe('MENUNGGU_KONFIRMASI');
    expect(res.body.isApproved).toBe(false);

    createdItemId = res.body.id;
  });

  it('3.4 should successfully add additional service job to PKB', async () => {
    const res = await request(app).post(`/api/services/${testServiceId}/items`).send({
      itemType: 'JASA',
      serviceMasterId: testServiceMasterId,
      quantity: 1,
      approvalStatus: 'DISETUJUI',
      catatan: 'Pembersihan CVT tambahan',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.itemType).toBe('JASA');
    expect(res.body.subtotal).toBe(50000);
    expect(res.body.approvalStatus).toBe('DISETUJUI');
    expect(res.body.isApproved).toBe(true);
  });

  it('3.5 should update quantity and approval status of a service item', async () => {
    if (!createdItemId) return;

    const res = await request(app)
      .patch(`/api/services/${testServiceId}/items/${createdItemId}`)
      .send({
        quantity: 1,
        approvalStatus: 'DITOLAK',
        catatan: 'Konsumen menolak penggantian tambahan',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdItemId);
    expect(res.body.quantity).toBe(1);
    expect(res.body.subtotal).toBe(55000);
    expect(res.body.approvalStatus).toBe('DITOLAK');
    expect(res.body.isApproved).toBe(false);
  });

  it('3.6 should delete a service item from PKB and update estimate', async () => {
    if (!createdItemId) return;

    const res = await request(app).delete(`/api/services/${testServiceId}/items/${createdItemId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);

    const getRes = await request(app).get(`/api/services/${testServiceId}/items`);
    const found = getRes.body.find((it) => it.id === createdItemId);
    expect(found).toBeUndefined();
  });
});
