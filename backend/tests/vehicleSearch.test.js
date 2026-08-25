const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db');

describe('Vehicle Search & Lookup API Tests', () => {
  let createdVehicleId;
  let createdCustomerId;

  beforeAll(async () => {
    // Create a known test customer & vehicle
    const customer = await prisma.customer.create({
      data: {
        nama: 'Test Pemilik',
        telepon: '081299990000',
      },
    });
    createdCustomerId = customer.id;

    const brand = await prisma.motorBrand.findFirst();
    const type = await prisma.motorType.findFirst({ where: { brand_id: brand.id } });
    const capacity = await prisma.engineCapacity.findFirst();

    const vehicle = await prisma.vehicle.create({
      data: {
        nopol: 'B 8888 TEST',
        customer: { connect: { id: createdCustomerId } },
        motorType: { connect: { id: type.id } },
        engineCapacity: { connect: { id: capacity.id } },
        warna: 'Hitam Metalik',
        tahun_pembuatan: 2023,
        km_terakhir: 15000,
      },
    });
    createdVehicleId = vehicle.id;
  });

  afterAll(async () => {
    if (createdVehicleId) {
      await prisma.vehicle.deleteMany({ where: { id: createdVehicleId } });
    }
    if (createdCustomerId) {
      await prisma.customer.deleteMany({ where: { id: createdCustomerId } });
    }
  });

  it('1. should find existing vehicle by nopol query parameter', async () => {
    const res = await request(app).get('/api/vehicles/search?nopol=B8888TEST');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nopol');
    expect(res.body.nopol).toBe('B 8888 TEST');
    expect(res.body).toHaveProperty('customer');
    expect(res.body.customer.nama).toBe('Test Pemilik');
  });

  it('2. should handle vehicle search with spaces in nopol', async () => {
    const res = await request(app).get('/api/vehicles/search?nopol=B 8888 TEST');

    expect(res.statusCode).toBe(200);
    expect(res.body.nopol).toBe('B 8888 TEST');
  });

  it('3. should return null when vehicle nopol does not exist', async () => {
    const res = await request(app).get('/api/vehicles/search?nopol=Z9999NONEXISTENT');

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });

  it('4. should reject search when nopol query param is missing', async () => {
    const res = await request(app).get('/api/vehicles/search');

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});
