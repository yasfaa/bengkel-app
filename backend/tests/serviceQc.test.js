const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('🔍 Stage 4: Quality Control (QC) & Inspection Audit API Tests', () => {
  let adminToken = null;
  let adminUser = null;
  let testServiceId = null;
  let mechanicName = null;
  let testServiceMasterId = null;

  beforeAll(async () => {
    // 1. Authenticate Admin
    const altLogin = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });
    adminToken = altLogin.body?.data?.accessToken;
    adminUser = altLogin.body?.data?.user;

    // 2. Ensure test service master exists
    let serviceMaster = await prisma.serviceMaster.findFirst();
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

    // 3. Ensure a test mechanic exists
    const mechanic = await prisma.mechanic.findFirst({ include: { user: true } });
    mechanicName = mechanic?.user?.nama || 'Asep Hidayat';

    // 4. Create a test Service / PKB in 'Menunggu'
    const uniqueNopol = `B ${Math.floor(1000 + Math.random() * 8999)} QCT`;
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: 'Hendra Gunawan',
        phone: '081234567890',
        nopol: uniqueNopol,
        motorType: 'Honda Vario 160',
        keluhan: 'Tarikan gas berat dan rem berdecit',
        serviceMasterId: testServiceMasterId,
        warna: 'Hitam',
        tahunPembuatan: 2023,
        kmMasuk: 12000,
        levelBensin: '1/2',
      });

    expect(res.status).toBe(201);
    testServiceId = res.body.id;
  });

  afterAll(async () => {
    if (testServiceId) {
      await prisma.serviceQC.deleteMany({ where: { service_id: testServiceId } });
      await prisma.serviceItem.deleteMany({ where: { service_id: testServiceId } });
      await prisma.service.deleteMany({ where: { id: testServiceId } });
    }
    await prisma.$disconnect();
  });

  it('1. should start working on the vehicle (Menunggu -> Dikerjakan)', async () => {
    const res = await request(app)
      .patch(`/api/services/${testServiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Dikerjakan',
        mechanicName: mechanicName,
        allowBusyOverride: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Dikerjakan');
    expect(res.body.mechanicName).toBe(mechanicName);
  });

  it('2. should complete service (Dikerjakan -> Selesai) and persist Quality Control (QC) audit data', async () => {
    const qcPayload = {
      kelistrikan_ok: true,
      rem_ok: true,
      gas_ok: true,
      test_ride_ok: true,
      part_bekas_diserahkan: true,
      catatan: 'Pemeriksaan akhir selesai, kelistrikan dan pengereman berfungsi optimal.',
    };

    const res = await request(app)
      .patch(`/api/services/${testServiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Selesai',
        qcData: qcPayload,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Selesai');
    expect(res.body.tgl_selesai).toBeDefined();

    // Verify QC relation in database
    const qcRecord = await prisma.serviceQC.findUnique({
      where: { service_id: testServiceId },
      include: { qcBy: true },
    });

    expect(qcRecord).toBeDefined();
    expect(qcRecord.kelistrikan_ok).toBe(true);
    expect(qcRecord.rem_ok).toBe(true);
    expect(qcRecord.gas_ok).toBe(true);
    expect(qcRecord.test_ride_ok).toBe(true);
    expect(qcRecord.part_bekas_diserahkan).toBe(true);
    expect(qcRecord.catatan).toBe(qcPayload.catatan);
    if (adminUser) {
      expect(qcRecord.qc_by_id).toBe(adminUser.id);
    }
  });

  it('3. should return serviceQC data when fetching service list', async () => {
    const res = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const targetService = res.body.find((s) => s.id === testServiceId);
    expect(targetService).toBeDefined();
    expect(targetService.serviceQC).toBeDefined();
    expect(targetService.serviceQC.kelistrikan_ok).toBe(true);
    expect(targetService.serviceQC.rem_ok).toBe(true);
  });

  it('4. should allow partial QC checks with notes (e.g. test_ride_ok: false)', async () => {
    // Re-update QC data
    const partialQcPayload = {
      kelistrikan_ok: true,
      rem_ok: true,
      gas_ok: true,
      test_ride_ok: false,
      part_bekas_diserahkan: true,
      catatan: 'Uji jalan ditunda karena cuaca hujan lebat',
    };

    const res = await request(app)
      .patch(`/api/services/${testServiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Selesai',
        qcData: partialQcPayload,
      });

    expect(res.status).toBe(200);

    const updatedQc = await prisma.serviceQC.findUnique({
      where: { service_id: testServiceId },
    });
    expect(updatedQc.test_ride_ok).toBe(false);
    expect(updatedQc.catatan).toBe(partialQcPayload.catatan);
  });

  it('5. should reject invalid qcData payload types (Schema validation)', async () => {
    const invalidPayload = {
      status: 'Selesai',
      qcData: {
        kelistrikan_ok: 'BUKAN_BOOLEAN', // invalid type
      },
    };

    const res = await request(app)
      .patch(`/api/services/${testServiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
  });
});
