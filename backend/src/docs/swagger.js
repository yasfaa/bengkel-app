/**
 * OpenAPI 3.0 Specification for BengkelKu API (Complete Master Data CRUD)
 */
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'BengkelKu REST API Documentation',
    version: '1.0.0',
    description: `API Documentation for BengkelKu Workshop Management System.
    
Terdiri dari modul:
- **Master Jasa Servis**: CRUD katalog jasa servis, tarif, estimasi durasi, dan kategori.
- **Master Pemasok (Supplier)**: CRUD pemasok / distributor suku cadang.
- **Master Suku Cadang (Sparepart)**: CRUD katalog suku cadang, stok, harga beli/jual, dan supplier.
- **Master Motor**: CRUD merk (Brand), tipe (Type), dan kapasitas mesin (Engine Capacity).
- **Master Teknisi (Mechanic)**: CRUD teknisi bengkel, spesialisasi, dan status kerja.
- **Kendaraan (Vehicle)**: Pencarian dan resolusi spesifikasi motor.
- **Antrean Servis (PKB)**: Pendaftaran servis/PKB baru, inspeksi awal, penugasan teknisi, dan pembaruan status.`,
    contact: {
      name: 'BengkelKu Engineering Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Development Server (Default)',
    },
  ],
  tags: [
    { name: 'Health', description: 'System status and health check' },
    { name: 'Master - Services', description: 'Katalog master jasa servis dan tarif' },
    { name: 'Master - Suppliers', description: 'Katalog master pemasok / distributor suku cadang' },
    { name: 'Master - Spareparts', description: 'Katalog master suku cadang & persediaan' },
    { name: 'Master - Motor', description: 'Master merk, tipe, dan kapasitas mesin motor' },
    { name: 'Mechanics', description: 'Data mekanik/teknisi bengkel' },
    { name: 'Vehicles', description: 'Pencarian dan data kendaraan pelanggan' },
    { name: 'Services (PKB & Antrean)', description: 'Pendaftaran & pengelolaan antrean servis' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Pemeriksaan status server',
        responses: {
          200: {
            description: 'Server berjalan normal.',
          },
        },
      },
    },
    // Services
    '/api/master/services': {
      get: {
        tags: ['Master - Services'],
        summary: 'Daftar master jasa servis',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Master - Services'],
        summary: 'Tambah master jasa servis baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/master/services/{id}': {
      get: {
        tags: ['Master - Services'],
        summary: 'Detail jasa servis',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Success' } },
      },
      patch: {
        tags: ['Master - Services'],
        summary: 'Perbarui jasa servis',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master - Services'],
        summary: 'Hapus jasa servis',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Suppliers
    '/api/master/suppliers': {
      get: {
        tags: ['Master - Suppliers'],
        summary: 'Daftar supplier suku cadang',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Master - Suppliers'],
        summary: 'Tambah supplier baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/master/suppliers/{id}': {
      patch: {
        tags: ['Master - Suppliers'],
        summary: 'Perbarui supplier',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master - Suppliers'],
        summary: 'Hapus supplier',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Spareparts
    '/api/master/spareparts': {
      get: {
        tags: ['Master - Spareparts'],
        summary: 'Daftar master suku cadang',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Master - Spareparts'],
        summary: 'Tambah suku cadang baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/master/spareparts/{id}': {
      get: {
        tags: ['Master - Spareparts'],
        summary: 'Detail suku cadang',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Success' } },
      },
      patch: {
        tags: ['Master - Spareparts'],
        summary: 'Perbarui data suku cadang',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master - Spareparts'],
        summary: 'Hapus suku cadang',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Motor Brands
    '/api/master/brands': {
      get: {
        tags: ['Master - Motor'],
        summary: 'Daftar merk motor',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Master - Motor'],
        summary: 'Tambah merk motor baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/master/brands/{id}': {
      patch: {
        tags: ['Master - Motor'],
        summary: 'Perbarui merk motor',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master - Motor'],
        summary: 'Hapus merk motor',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Motor Types
    '/api/master/types': {
      get: {
        tags: ['Master - Motor'],
        summary: 'Daftar tipe motor (bisa filter ?brandId=X)',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Master - Motor'],
        summary: 'Tambah tipe motor baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/master/types/{id}': {
      patch: {
        tags: ['Master - Motor'],
        summary: 'Perbarui tipe motor',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master - Motor'],
        summary: 'Hapus tipe motor',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Engine Capacities
    '/api/master/capacities': {
      get: {
        tags: ['Master - Motor'],
        summary: 'Daftar kapasitas mesin motor',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Master - Motor'],
        summary: 'Tambah kapasitas mesin baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/master/capacities/{id}': {
      patch: {
        tags: ['Master - Motor'],
        summary: 'Perbarui kapasitas mesin',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master - Motor'],
        summary: 'Hapus kapasitas mesin',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Mechanics
    '/api/mechanics': {
      get: {
        tags: ['Mechanics'],
        summary: 'Daftar semua mekanik',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Mechanics'],
        summary: 'Tambah mekanik baru',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/mechanics/{id}': {
      get: {
        tags: ['Mechanics'],
        summary: 'Detail data mekanik',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Success' } },
      },
      patch: {
        tags: ['Mechanics'],
        summary: 'Perbarui data mekanik',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Mechanics'],
        summary: 'Hapus data mekanik',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    // Vehicles
    '/api/vehicles/search': {
      get: {
        tags: ['Vehicles'],
        summary: 'Cari kendaraan berdasarkan nomor polisi (Nopol)',
        parameters: [{ name: 'nopol', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    // Services / PKB
    '/api/services': {
      get: {
        tags: ['Services (PKB & Antrean)'],
        summary: 'Daftar antrean servis & PKB',
        responses: { 200: { description: 'Success' } },
      },
      post: {
        tags: ['Services (PKB & Antrean)'],
        summary: 'Pendaftaran servis baru & pembuatan PKB (Reception SA)',
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/services/{id}/status': {
      patch: {
        tags: ['Services (PKB & Antrean)'],
        summary: 'Pembaruan status servis & penugasan mekanik',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
    },
  },
};

module.exports = swaggerSpec;
