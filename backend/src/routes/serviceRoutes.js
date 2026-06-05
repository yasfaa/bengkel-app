const express = require('express');
const router = express.Router();
const prisma = require('../db');

const parseId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const parsePrice = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildMotorLabel = (brandName, typeName, capacityName) => {
  const parts = [brandName, typeName].filter(Boolean);
  const base = parts.join(' ');
  return capacityName ? `${base} (${capacityName})` : base;
};

const resolveMotorSelection = async (tx, body) => {
  const brandId = parseId(body.brandId);
  const typeId = parseId(body.typeId);
  const capacityId = parseId(body.capacityId);

  if (brandId && typeId && capacityId) {
    const [brand, type, capacity] = await Promise.all([
      tx.motorBrand.findUnique({ where: { id: brandId } }),
      tx.motorType.findUnique({ where: { id: typeId }, include: { brand: true } }),
      tx.engineCapacity.findUnique({ where: { id: capacityId } }),
    ]);

    if (brand && type && capacity && type.brand_id === brand.id) {
      return {
        brandId: brand.id,
        typeId: type.id,
        capacityId: capacity.id,
        brandName: brand.nama,
        typeName: type.nama,
        capacityName: capacity.kapasitas,
      };
    }
  }

  const motorType = normalizeText(body.motorType);
  const fallbackParts = motorType.split(/\s+/).filter(Boolean);
  const brandName = normalizeText(body.brandName) || fallbackParts[0] || 'Umum';
  const capacityName = normalizeText(body.capacityName) || '150cc';
  const typeName = normalizeText(body.typeName) || fallbackParts.slice(1).join(' ') || 'Motor';

  const resolvedBrand = await tx.motorBrand.upsert({
    where: { nama: brandName },
    update: {},
    create: { nama: brandName },
  });

  const resolvedType = await tx.motorType.upsert({
    where: {
      brand_id_nama: {
        brand_id: resolvedBrand.id,
        nama: typeName,
      },
    },
    update: {},
    create: {
      brand_id: resolvedBrand.id,
      nama: typeName,
    },
  });

  const resolvedCapacity = await tx.engineCapacity.upsert({
    where: { kapasitas: capacityName },
    update: {},
    create: { kapasitas: capacityName },
  });

  return {
    brandId: resolvedBrand.id,
    typeId: resolvedType.id,
    capacityId: resolvedCapacity.id,
    brandName: resolvedBrand.nama,
    typeName: resolvedType.nama,
    capacityName: resolvedCapacity.kapasitas,
  };
};

// GET /api/master/services - Ambil daftar master jasa servis
router.get('/master/services', async (req, res) => {
  try {
    const services = await prisma.serviceMaster.findMany({
      orderBy: [
        { is_active: 'desc' },
        { nama: 'asc' },
      ],
    });

    res.json(services);
  } catch (error) {
    console.error('Error fetching service masters:', error);
    res.status(500).json({ error: 'Gagal mengambil data jasa servis.' });
  }
});

// GET /api/master/services/:id - Ambil detail master jasa servis
router.get('/master/services/:id', async (req, res) => {
  const serviceMasterId = parseId(req.params.id);

  if (!serviceMasterId) {
    return res.status(400).json({ error: 'ID jasa servis tidak valid.' });
  }

  try {
    const serviceMaster = await prisma.serviceMaster.findUnique({
      where: { id: serviceMasterId },
    });

    if (!serviceMaster) {
      return res.status(404).json({ error: 'Data jasa servis tidak ditemukan.' });
    }

    res.json(serviceMaster);
  } catch (error) {
    console.error('Error fetching service master detail:', error);
    res.status(500).json({ error: 'Gagal mengambil detail jasa servis.' });
  }
});

// POST /api/master/services - Tambah master jasa servis
router.post('/master/services', async (req, res) => {
  const nama = normalizeText(req.body.nama);
  const harga = parsePrice(req.body.harga);
  const deskripsi = normalizeText(req.body.deskripsi);
  const isActive = typeof req.body.is_active === 'boolean' ? req.body.is_active : true;

  if (!nama || harga === null) {
    return res.status(400).json({ error: 'Nama dan harga jasa servis wajib diisi.' });
  }

  try {
    const created = await prisma.serviceMaster.create({
      data: {
        nama,
        harga,
        deskripsi: deskripsi || null,
        is_active: isActive,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating service master:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Nama jasa servis sudah digunakan.' });
    }

    res.status(500).json({ error: 'Gagal menambahkan jasa servis.' });
  }
});

// PATCH /api/master/services/:id - Ubah master jasa servis
router.patch('/master/services/:id', async (req, res) => {
  const serviceMasterId = parseId(req.params.id);

  if (!serviceMasterId) {
    return res.status(400).json({ error: 'ID jasa servis tidak valid.' });
  }

  const data = {};
  const nama = normalizeText(req.body.nama);
  const harga = req.body.harga !== undefined ? parsePrice(req.body.harga) : null;
  const deskripsi = req.body.deskripsi !== undefined ? normalizeText(req.body.deskripsi) : undefined;
  const isActive = req.body.is_active;

  if (nama) data.nama = nama;
  if (harga !== null) data.harga = harga;
  if (deskripsi !== undefined) data.deskripsi = deskripsi || null;
  if (typeof isActive === 'boolean') data.is_active = isActive;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Tidak ada data yang perlu diperbarui.' });
  }

  try {
    const updated = await prisma.serviceMaster.update({
      where: { id: serviceMasterId },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating service master:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Nama jasa servis sudah digunakan.' });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Data jasa servis tidak ditemukan.' });
    }

    res.status(500).json({ error: 'Gagal memperbarui jasa servis.' });
  }
});

// DELETE /api/master/services/:id - Hapus master jasa servis
router.delete('/master/services/:id', async (req, res) => {
  const serviceMasterId = parseId(req.params.id);

  if (!serviceMasterId) {
    return res.status(400).json({ error: 'ID jasa servis tidak valid.' });
  }

  try {
    await prisma.serviceMaster.delete({
      where: { id: serviceMasterId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service master:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Data jasa servis tidak ditemukan.' });
    }

    res.status(500).json({ error: 'Gagal menghapus jasa servis.' });
  }
});

// GET /api/master/brands - Ambil daftar merk motor
router.get('/master/brands', async (req, res) => {
  try {
    const brands = await prisma.motorBrand.findMany({
      orderBy: { nama: 'asc' },
    });

    res.json(brands);
  } catch (error) {
    console.error('Error fetching motor brands:', error);
    res.status(500).json({ error: 'Gagal mengambil data merk motor.' });
  }
});

// GET /api/master/types?brandId=... - Ambil tipe motor berdasarkan merk
router.get('/master/types', async (req, res) => {
  const brandId = parseId(req.query.brandId);

  if (!brandId) {
    return res.status(400).json({ error: 'Parameter brandId wajib diisi.' });
  }

  try {
    const types = await prisma.motorType.findMany({
      where: { brand_id: brandId },
      orderBy: { nama: 'asc' },
    });

    res.json(types);
  } catch (error) {
    console.error('Error fetching motor types:', error);
    res.status(500).json({ error: 'Gagal mengambil data tipe motor.' });
  }
});

// GET /api/master/capacities - Ambil daftar kapasitas mesin
router.get('/master/capacities', async (req, res) => {
  try {
    const capacities = await prisma.engineCapacity.findMany({
      orderBy: { kapasitas: 'asc' },
    });

    res.json(capacities);
  } catch (error) {
    console.error('Error fetching engine capacities:', error);
    res.status(500).json({ error: 'Gagal mengambil data kapasitas mesin.' });
  }
});

// 1. GET /api/mechanics - Ambil semua mekanik
router.get('/mechanics', async (req, res) => {
  try {
    const mechanics = await prisma.mechanic.findMany();
    res.json(mechanics);
  } catch (error) {
    console.error('Error fetching mechanics:', error);
    res.status(500).json({ error: 'Gagal mengambil data mekanik.' });
  }
});

// 2. GET /api/vehicles/search - Cari kendaraan berdasarkan nopol
router.get('/vehicles/search', async (req, res) => {
  const { nopol } = req.query;
  if (!nopol) {
    return res.status(400).json({ error: 'Parameter nopol wajib diisi.' });
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        nopol: {
          contains: nopol
        }
      },
      include: {
        customer: true,
        brand: true,
        motorTypeMaster: true,
        engineCapacity: true,
      }
    });

    if (!vehicle) {
      return res.json(null);
    }

    res.json({
      ...vehicle,
      brandId: vehicle.brand_id,
      typeId: vehicle.motor_type_id,
      capacityId: vehicle.engine_capacity_id,
      brandName: vehicle.brand ? vehicle.brand.nama : vehicle.merk,
      typeName: vehicle.motorTypeMaster ? vehicle.motorTypeMaster.nama : vehicle.tipe,
      capacityName: vehicle.engineCapacity ? vehicle.engineCapacity.kapasitas : vehicle.kapasitas_mesin,
    });
  } catch (error) {
    console.error('Error searching vehicle:', error);
    res.status(500).json({ error: 'Gagal mencari data kendaraan.' });
  }
});

// 3. GET /api/services - Ambil semua daftar servis
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        vehicle: {
          include: {
            customer: true
          }
        },
        mechanic: true
      },
      orderBy: {
        tgl_masuk: 'desc'
      }
    });

    // Format output agar lebih mudah dikonsumsi frontend
    const formattedServices = services.map(s => ({
      id: s.id,
      nopol: s.vehicle.nopol,
      motorType: `${s.vehicle.merk} ${s.vehicle.tipe} (${s.vehicle.kapasitas_mesin})`,
      customerName: s.vehicle.customer.nama,
      phone: s.vehicle.customer.telepon,
      keluhan: s.keluhan,
      mechanicName: s.mechanic ? s.mechanic.nama : null,
      status: s.status,
      isPaid: false, // Default untuk MVP V1, diupdate saat ada transaksi
      tgl_masuk: s.tgl_masuk,
      tgl_selesai: s.tgl_selesai
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Gagal mengambil data antrean servis.' });
  }
});

// 4. POST /api/services - Daftarkan servis baru
router.post('/services', async (req, res) => {
  const { customerName, phone, nopol, motorType, keluhan, mechanicName } = req.body;

  if (!customerName || !phone || !nopol || !keluhan) {
    return res.status(400).json({ error: 'Semua kolom wajib diisi.' });
  }

  try {
    // Jalankan dalam satu transaksi untuk menjamin integritas data
    const result = await prisma.$transaction(async (tx) => {
      // 1. Cari atau buat Customer
      let customer = await tx.customer.findFirst({
        where: { telepon: phone }
      });
      if (!customer) {
        customer = await tx.customer.create({
          data: { nama: customerName, telepon: phone }
        });
      }

      // 2. Cari atau buat Kendaraan (nopol unik)
      let vehicle = await tx.vehicle.findUnique({
        where: { nopol: nopol.toUpperCase() }
      });
      if (!vehicle) {
        const motorSelection = await resolveMotorSelection(tx, req.body);
        const vehicleKind = typeof req.body.jenis === 'string' && req.body.jenis.trim()
          ? req.body.jenis.trim().toLowerCase()
          : (typeof motorType === 'string' && motorType.toLowerCase().includes('matic') ? 'matic' : 'bebek');
        
        vehicle = await tx.vehicle.create({
          data: {
            customer_id: customer.id,
            nopol: nopol.toUpperCase(),
            brand_id: motorSelection.brandId,
            motor_type_id: motorSelection.typeId,
            engine_capacity_id: motorSelection.capacityId,
            merk: motorSelection.brandName,
            tipe: motorSelection.typeName,
            kapasitas_mesin: motorSelection.capacityName,
            jenis: vehicleKind
          }
        });
      }

      // 3. Cari Mekanik jika diassign
      let mechanic = null;
      if (mechanicName) {
        mechanic = await tx.mechanic.findFirst({
          where: { nama: mechanicName }
        });
      }

      // 4. Buat antrean Servis
      const statusInitial = mechanic ? 'Dikerjakan' : 'Menunggu';
      const service = await tx.service.create({
        data: {
          vehicle_id: vehicle.id,
          mechanic_id: mechanic ? mechanic.id : null,
          keluhan,
          status: statusInitial
        },
        include: {
          vehicle: {
            include: { customer: true }
          },
          mechanic: true
        }
      });

      return service;
    });

    res.status(201).json({
      id: result.id,
      nopol: result.vehicle.nopol,
      motorType: buildMotorLabel(result.vehicle.merk, result.vehicle.tipe, result.vehicle.kapasitas_mesin),
      customerName: result.vehicle.customer.nama,
      phone: result.vehicle.customer.telepon,
      keluhan: result.keluhan,
      mechanicName: result.mechanic ? result.mechanic.nama : null,
      status: result.status,
      isPaid: false
    });

  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Gagal mendaftarkan servis baru.' });
  }
});

// 5. PATCH /api/services/:id/status - Update status servis & assign mekanik
router.patch('/services/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, mechanicName } = req.body;

  try {
    const serviceId = parseInt(id);
    let mechanicId = null;

    if (mechanicName) {
      const mechanic = await prisma.mechanic.findFirst({
        where: { nama: mechanicName }
      });
      if (mechanic) {
        mechanicId = mechanic.id;
      }
    }

    const updateData = { status };
    if (mechanicId) {
      updateData.mechanic_id = mechanicId;
    }
    if (status === 'Selesai') {
      updateData.tgl_selesai = new Date();
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        vehicle: {
          include: { customer: true }
        },
        mechanic: true
      }
    });

    res.json({
      id: updatedService.id,
      nopol: updatedService.vehicle.nopol,
      motorType: buildMotorLabel(updatedService.vehicle.merk, updatedService.vehicle.tipe, updatedService.vehicle.kapasitas_mesin),
      customerName: updatedService.vehicle.customer.nama,
      phone: updatedService.vehicle.customer.telepon,
      keluhan: updatedService.keluhan,
      mechanicName: updatedService.mechanic ? updatedService.mechanic.nama : null,
      status: updatedService.status,
      isPaid: false
    });

  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ error: 'Gagal memperbarui status servis.' });
  }
});

module.exports = router;
