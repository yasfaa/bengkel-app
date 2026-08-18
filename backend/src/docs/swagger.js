/**
 * OpenAPI 3.0 Specification for BengkelKu API
 */
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'BengkelKu REST API Documentation',
    version: '1.0.0',
    description: `API Documentation for BengkelKu Workshop Management System.
    
Terdiri dari modul:
- **Master Data**: Katalog Jasa Servis, Merk Motor, Tipe Motor, dan Kapasitas Mesin.
- **Mekanik**: Manajemen dan daftar teknisi bengkel.
- **Kendaraan**: Pencarian dan resolusi spesifikasi motor.
- **Antrean Servis**: Alur pendaftaran servis baru, penugasan teknisi, dan pembaruan status.`,
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
    { name: 'Master - Motor', description: 'Master merk, tipe, dan kapasitas mesin motor' },
    { name: 'Mechanics', description: 'Data mekanik/teknisi bengkel' },
    { name: 'Vehicles', description: 'Pencarian dan data kendaraan pelanggan' },
    { name: 'Services (Antrean)', description: 'Pendaftaran & pengelolaan antrean servis' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Pemeriksaan status server',
        description: 'Mengembalikan status kesehatan backend server beserta timestamp saat ini.',
        responses: {
          200: {
            description: 'Server dalam kondisi sehat dan siap melayani permintaan.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Backend BengkelKu is running.' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/master/services': {
      get: {
        tags: ['Master - Services'],
        summary: 'Dapatkan daftar master jasa servis',
        description: 'Mengambil semua data katalog jasa servis yang tersedia beserta harga dan status aktifnya.',
        responses: {
          200: {
            description: 'Daftar master jasa servis berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ServiceMaster' },
                },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        tags: ['Master - Services'],
        summary: 'Tambah master jasa servis baru',
        description: 'Mendaftarkan item master jasa servis baru ke dalam katalog.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateServiceMasterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Jasa servis berhasil ditambahkan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ServiceMaster' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/ConflictError' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/master/services/{id}': {
      get: {
        tags: ['Master - Services'],
        summary: 'Dapatkan detail master jasa servis',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID master jasa servis',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Detail jasa servis berhasil diambil.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ServiceMaster' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      patch: {
        tags: ['Master - Services'],
        summary: 'Perbarui master jasa servis',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID master jasa servis',
            schema: { type: 'integer', example: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateServiceMasterRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Jasa servis berhasil diperbarui.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ServiceMaster' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/ConflictError' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      delete: {
        tags: ['Master - Services'],
        summary: 'Hapus master jasa servis',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID master jasa servis',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          204: { description: 'Jasa servis berhasil dihapus.' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/master/brands': {
      get: {
        tags: ['Master - Motor'],
        summary: 'Daftar semua merk motor',
        responses: {
          200: {
            description: 'Daftar merk motor berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MotorBrand' },
                },
              },
            },
          },
        },
      },
    },
    '/api/master/types': {
      get: {
        tags: ['Master - Motor'],
        summary: 'Daftar tipe motor berdasarkan merk',
        parameters: [
          {
            name: 'brandId',
            in: 'query',
            required: true,
            description: 'ID Merk motor (contoh: 1 untuk Honda)',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Daftar tipe motor berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/MotorType' },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/master/capacities': {
      get: {
        tags: ['Master - Motor'],
        summary: 'Daftar kapasitas mesin motor (cc)',
        responses: {
          200: {
            description: 'Daftar kapasitas mesin berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/EngineCapacity' },
                },
              },
            },
          },
        },
      },
    },
    '/api/mechanics': {
      get: {
        tags: ['Mechanics'],
        summary: 'Daftar semua mekanik',
        responses: {
          200: {
            description: 'Daftar teknisi/mekanik berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Mechanic' },
                },
              },
            },
          },
        },
      },
    },
    '/api/vehicles/search': {
      get: {
        tags: ['Vehicles'],
        summary: 'Cari kendaraan berdasarkan nomor polisi (Nopol)',
        parameters: [
          {
            name: 'nopol',
            in: 'query',
            required: true,
            description: 'Nomor plat polisi kendaraan (contoh: B 1234 KZX)',
            schema: { type: 'string', example: 'B 4455 KZX' },
          },
        ],
        responses: {
          200: {
            description: 'Data kendaraan ditemukan atau null jika belum pernah terdaftar.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/VehicleDetail' },
                    { type: 'null' },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/services': {
      get: {
        tags: ['Services (Antrean)'],
        summary: 'Daftar antrean servis motor',
        description: 'Mengambil riwayat & antrean servis terurut berdasarkan waktu masuk terbaru.',
        responses: {
          200: {
            description: 'Daftar antrean servis berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ServiceQueueItem' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Services (Antrean)'],
        summary: 'Pendaftaran servis baru (Order Registrasi)',
        description: 'Mendaftarkan pelanggan, kendaraan, dan order antrean servis baru secara atomik dalam satu transaksi database.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateServiceQueueRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Antrean servis berhasil didaftarkan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ServiceQueueItem' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/api/services/{id}/status': {
      patch: {
        tags: ['Services (Antrean)'],
        summary: 'Pembaruan status servis & penugasan mekanik',
        description: 'Memperbarui status antrean (Menunggu / Dikerjakan / Selesai) dan menugaskan teknisi.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID order servis',
            schema: { type: 'integer', example: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateServiceStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Status servis berhasil diperbarui.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ServiceQueueItem' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
  components: {
    schemas: {
      ServiceMaster: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama: { type: 'string', example: 'Servis Ringan' },
          harga: { type: 'number', example: 50000 },
          deskripsi: { type: 'string', nullable: true, example: 'Perawatan dasar dan pengecekan umum.' },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateServiceMasterRequest: {
        type: 'object',
        required: ['nama', 'harga'],
        properties: {
          nama: { type: 'string', example: 'Ganti Kampas Rem' },
          harga: { type: 'number', example: 45000 },
          deskripsi: { type: 'string', example: 'Jasa penggantian kampas rem depan/belakang' },
          is_active: { type: 'boolean', default: true, example: true },
        },
      },
      UpdateServiceMasterRequest: {
        type: 'object',
        properties: {
          nama: { type: 'string', example: 'Ganti Kampas Rem Cakram' },
          harga: { type: 'number', example: 50000 },
          deskripsi: { type: 'string', example: 'Jasa servis dan ganti kampas cakram' },
          is_active: { type: 'boolean', example: true },
        },
      },
      MotorBrand: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama: { type: 'string', example: 'Honda' },
        },
      },
      MotorType: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama: { type: 'string', example: 'Beat' },
          brand_id: { type: 'integer', example: 1 },
        },
      },
      EngineCapacity: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          kapasitas: { type: 'string', example: '110cc' },
        },
      },
      Mechanic: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama: { type: 'string', example: 'Asep' },
          tgl_lahir: { type: 'string', format: 'date-time', example: '1995-05-10T00:00:00.000Z' },
          waktu_kerja: { type: 'string', example: 'Full-time (08:00 - 17:00)' },
        },
      },
      VehicleDetail: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nopol: { type: 'string', example: 'B 4455 KZX' },
          merk: { type: 'string', example: 'Honda' },
          tipe: { type: 'string', example: 'Beat' },
          kapasitas_mesin: { type: 'string', example: '110cc' },
          jenis: { type: 'string', example: 'matic' },
          brandId: { type: 'integer', nullable: true, example: 1 },
          typeId: { type: 'integer', nullable: true, example: 1 },
          capacityId: { type: 'integer', nullable: true, example: 1 },
          brandName: { type: 'string', example: 'Honda' },
          typeName: { type: 'string', example: 'Beat' },
          capacityName: { type: 'string', example: '110cc' },
          customer: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nama: { type: 'string', example: 'Ahmad Fauzi' },
              telepon: { type: 'string', example: '081234567890' },
            },
          },
        },
      },
      ServiceQueueItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nopol: { type: 'string', example: 'B 4455 KZX' },
          motorType: { type: 'string', example: 'Honda Beat (110cc)' },
          customerName: { type: 'string', example: 'Ahmad Fauzi' },
          phone: { type: 'string', example: '081234567890' },
          keluhan: { type: 'string', example: 'Ganti oli dan rem belakang bunyi' },
          mechanicName: { type: 'string', nullable: true, example: 'Asep' },
          status: { type: 'string', enum: ['Menunggu', 'Dikerjakan', 'Selesai'], example: 'Dikerjakan' },
          isPaid: { type: 'boolean', example: false },
          tgl_masuk: { type: 'string', format: 'date-time' },
          tgl_selesai: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreateServiceQueueRequest: {
        type: 'object',
        required: ['customerName', 'phone', 'nopol', 'keluhan'],
        properties: {
          customerName: { type: 'string', example: 'Ahmad Fauzi' },
          phone: { type: 'string', example: '081234567890' },
          nopol: { type: 'string', example: 'B 4455 KZX' },
          brandId: { type: 'integer', example: 1 },
          typeId: { type: 'integer', example: 1 },
          capacityId: { type: 'integer', example: 1 },
          motorType: { type: 'string', example: 'Honda Beat (110cc)' },
          jenis: { type: 'string', example: 'matic' },
          keluhan: { type: 'string', example: 'Ganti oli dan rem belakang bunyi' },
          mechanicName: { type: 'string', nullable: true, example: 'Asep' },
          initialStatus: { type: 'string', enum: ['Menunggu', 'Dikerjakan', 'Selesai'], example: 'Dikerjakan' },
        },
      },
      UpdateServiceStatusRequest: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['Menunggu', 'Dikerjakan', 'Selesai'], example: 'Selesai' },
          mechanicName: { type: 'string', example: 'Asep' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          error: { type: 'string', example: 'Data yang diminta tidak ditemukan.' },
          message: { type: 'string', example: 'Data yang diminta tidak ditemukan.' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Parameter atau data yang dikirim tidak valid.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'Data tidak ditemukan.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      ConflictError: {
        description: 'Data duplikat atau bentrok dengan entitas yang sudah ada.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      InternalError: {
        description: 'Kesalahan internal pada server.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
