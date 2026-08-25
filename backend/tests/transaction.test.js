const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('💳 Stage 5: Cashier POS, Billing & Atomic Inventory Deduction Tests', () => {
  let adminToken = null;
  let adminUser = null;
  let testServiceId = null;
  let testSparepartId = null;
  let testServiceMasterId = null;
  let createdTrxId = null;
  const testServiceIds = [];

  beforeAll(async () => {
    // 1. Authenticate Admin
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });
    adminToken = loginRes.body?.data?.accessToken;
    adminUser = loginRes.body?.data?.user;

    // 2. Ensure supplier exists
    let supplier = await prisma.supplier.findFirst();
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { nama: 'PT Astra Otoparts POS Test', telepon: '0811223388' },
      });
    }

    // 3. Create test sparepart with known stock
    const sparepart = await prisma.sparepart.create({
      data: {
        kode_part: `TST-POS-${Math.floor(1000 + Math.random() * 9000)}`,
        nama: 'Oli Gardan Matic Synthetic 120ml',
        kategori: 'OLI',
        stok: 5, // 5 units available
        min_stok: 2,
        harga_beli: 15000,
        harga_jual: 20000,
        supplier_id: supplier.id,
      },
    });
    testSparepartId = sparepart.id;

    // 4. Create test service master (Base Package)
    const serviceMaster = await prisma.serviceMaster.create({
      data: {
        nama: `Paket Servis Rutin POS ${Math.floor(1000 + Math.random() * 9000)}`,
        harga: 50000,
        kategori: 'RINGAN',
        is_active: true,
      },
    });
    testServiceMasterId = serviceMaster.id;

    // 4b. Create extra jasa master
    const extraJasaMaster = await prisma.serviceMaster.create({
      data: {
        nama: `Jasa Pembersihan Injektor POS ${Math.floor(1000 + Math.random() * 9000)}`,
        harga: 25000,
        kategori: 'RINGAN',
        is_active: true,
      },
    });

    // 5. Create a completed service ready for cashier payment
    const uniqueNopol = `B ${Math.floor(1000 + Math.random() * 8999)} POS`;
    const svcRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: 'Budi Santoso POS',
        phone: '081399887766',
        nopol: uniqueNopol,
        motorType: 'Honda Vario 160',
        keluhan: 'Servis rutin dan ganti oli gardan',
        serviceMasterId: testServiceMasterId,
        warna: 'Hitam',
        tahunPembuatan: 2023,
        kmMasuk: 15000,
        levelBensin: 'Full',
      });

    testServiceId = svcRes.body.id;
    testServiceIds.push(testServiceId);

    // 6. Transition to Dikerjakan
    await request(app)
      .patch(`/api/services/${testServiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Dikerjakan',
        mechanicName: 'Asep Hidayat',
        allowBusyOverride: true,
      });

    // 7. Add approved sparepart (Qty: 2) -> Subtotal = 40.000
    await request(app)
      .post(`/api/services/${testServiceId}/items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        itemType: 'SPAREPART',
        sparepartId: testSparepartId,
        quantity: 2,
        approvalStatus: 'DISETUJUI',
        catatan: 'Ganti oli gardan 2 botol',
      });

    // 8. Add approved extra jasa (Subtotal = 25.000)
    await request(app)
      .post(`/api/services/${testServiceId}/items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        itemType: 'JASA',
        serviceMasterId: extraJasaMaster.id,
        quantity: 1,
        approvalStatus: 'DISETUJUI',
      });

    // 9. Complete QC and set status to 'Selesai'
    await request(app)
      .patch(`/api/services/${testServiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Selesai',
        qcData: {
          kelistrikan_ok: true,
          rem_ok: true,
          gas_ok: true,
          test_ride_ok: true,
          part_bekas_diserahkan: true,
          catatan: 'QC lolos, unit siap dibayar di kasir.',
        },
      });
  });

  afterAll(async () => {
    // Teardown created test data
    if (createdTrxId) {
      await prisma.transaction.deleteMany({ where: { id: createdTrxId } });
    }
    if (testServiceIds.length > 0) {
      await prisma.transaction.deleteMany({ where: { service_id: { in: testServiceIds } } });
      await prisma.serviceQC.deleteMany({ where: { service_id: { in: testServiceIds } } });
      await prisma.serviceItem.deleteMany({ where: { service_id: { in: testServiceIds } } });
      await prisma.service.deleteMany({ where: { id: { in: testServiceIds } } });
    }
    if (testSparepartId) {
      await prisma.sparepart.deleteMany({ where: { id: testSparepartId } });
    }
    if (testServiceMasterId) {
      await prisma.serviceMaster.deleteMany({ where: { id: testServiceMasterId } });
    }
    await prisma.$disconnect();
  });

  it('1. should list the completed service in unpaid completed services queue', async () => {
    const res = await request(app)
      .get('/api/transactions/unpaid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const target = res.body.find((s) => s.id === testServiceId);
    expect(target).toBeDefined();
    expect(target.basePackagePrice).toBe(50000);
    expect(target.totalJasa).toBe(75000); // 50.000 base + 25.000 extra jasa
    expect(target.totalSparepart).toBe(40000); // 2x 20.000 sparepart
    expect(target.grandTotal).toBe(115000); // 75.000 + 40.000
  });

  it('2. should reject cash payment if received amount is less than grand total', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        serviceId: testServiceId,
        metodeBayar: 'Tunai',
        diskon: 0,
        uangDiterima: 50000, // Grand total is 115.000
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/kurang dari total tagihan/i);
  });

  it('3. should process cashier payment, compute change, generate YYMMDD invoice, and deduct inventory stock atomically', async () => {
    // Initial sparepart stock is 5
    const initialPart = await prisma.sparepart.findUnique({ where: { id: testSparepartId } });
    expect(initialPart.stok).toBe(5);

    const payload = {
      serviceId: testServiceId,
      metodeBayar: 'Tunai',
      diskon: 5000, // 5.000 discount -> Grand Total = 110.000
      uangDiterima: 150000,
      catatan: 'Pembayaran tunai kasir frontdesk',
    };

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    const trx = res.body.data;
    createdTrxId = trx.id;

    // Verify invoice number format: INV-YYMMDD-XXX
    expect(trx.noInvoice).toMatch(/^INV-\d{6}-\d{3}$/);
    expect(trx.totalJasa).toBe(75000);
    expect(trx.totalSparepart).toBe(40000);
    expect(trx.diskon).toBe(5000);
    expect(trx.total).toBe(110000);
    expect(trx.uangDiterima).toBe(150000);
    expect(trx.kembalian).toBe(40000); // 150.000 - 110.000 = 40.000
    expect(trx.kasir).toBeDefined();
    expect(trx.kasir.id).toBe(adminUser.id);

    // Verify atomic inventory stock deduction (5 - 2 = 3)
    const updatedPart = await prisma.sparepart.findUnique({ where: { id: testSparepartId } });
    expect(updatedPart.stok).toBe(3);
  });

  it('4. should reject duplicate payment for the same PKB', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        serviceId: testServiceId,
        metodeBayar: 'QRIS',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/sudah pernah dibayar/i);
  });

  it('5. should fetch transaction history list and filter by invoice number', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.find((t) => t.id === createdTrxId);
    expect(found).toBeDefined();
    expect(found.noInvoice).toMatch(/^INV-\d{6}-\d{3}$/);
    expect(found.total).toBe(110000);

    // Filter by search
    const searchRes = await request(app)
      .get(`/api/transactions?search=${found.noInvoice}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body[0].noInvoice).toBe(found.noInvoice);
  });

  it('6. should fetch transaction invoice detail by ID for receipt printing', async () => {
    const res = await request(app)
      .get(`/api/transactions/${createdTrxId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdTrxId);
    expect(res.body.service).toBeDefined();
    expect(res.body.service.serviceItems.length).toBeGreaterThan(0);
    expect(res.body.service.nopol).toBeDefined();
  });

  it('7. should mark isPaid: true in GET /api/services and remove from unpaid queue after payment', async () => {
    const servicesRes = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(servicesRes.status).toBe(200);
    const paidService = servicesRes.body.find((s) => s.id === testServiceId);
    expect(paidService).toBeDefined();
    expect(paidService.isPaid).toBe(true);

    const unpaidRes = await request(app)
      .get('/api/transactions/unpaid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(unpaidRes.status).toBe(200);
    const existsInUnpaid = unpaidRes.body.some((s) => s.id === testServiceId);
    expect(existsInUnpaid).toBe(false);
  });
});
