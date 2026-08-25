/**
 * OpenAPI 3.0 Specification for BengkelKu API
 * Includes Complete Master Data, Auth (JWT + Cookie), RBAC User Management, and Service Items (Stage 3)
 */
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Wrenchly REST API Documentation',
    version: '1.0.0',
    description: `Dokumentasi API Terpadu Wrenchly - Smart Workshop Management & POS ERP.

### Arsitektur Keamanan:
- **Autentikasi**: Dual-Token JWT (Access Token 5m in-memory + Refresh Token 7d httpOnly Cookie).
- **Otorisasi (RBAC)**: Tiga peran pengguna (**ADMIN**, **MEKANIK**, **KEPALA_BENGKEL**).
- **Format Header**: \`Authorization: Bearer <access_token>\`.`,
    contact: {
      name: 'Wrenchly Engineering Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Development Server (Default)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan Access Token JWT yang didapatkan saat login.',
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Pemeriksaan status server dan database' },
    {
      name: 'Authentication',
      description: 'Autentikasi, login, silent refresh token, dan profile',
    },
    {
      name: 'User Management (RBAC)',
      description: 'Pengelolaan akun pengguna oleh Kepala Bengkel',
    },
    { name: 'Services (PKB & Antrean)', description: 'Pendaftaran & alur pengerjaan servis' },
    {
      name: 'Service Items (Stage 3)',
      description: 'Permintaan suku cadang & persetujuan konsumen',
    },
    { name: 'Mechanics', description: 'Data mekanik/teknisi bengkel' },
    { name: 'Master - Services', description: 'Katalog master jasa servis dan tarif' },
    { name: 'Master - Spareparts', description: 'Katalog master suku cadang & persediaan' },
    { name: 'Master - Suppliers', description: 'Katalog master pemasok / distributor' },
    { name: 'Master - Motor', description: 'Master merk, tipe, dan kapasitas mesin motor' },
    { name: 'Vehicles', description: 'Pencarian data kendaraan pelanggan' },
    {
      name: 'Transactions & POS (Stage 5)',
      description: 'Kasir, pembayaran invoice PKB, dan pemotongan stok otomatis',
    },
  ],
  paths: {
    // Health Check
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Pemeriksaan status server & database',
        responses: { 200: { description: 'Server berjalan normal' } },
      },
    },

    // Authentication Endpoints
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login akun pengguna',
        description:
          'Memverifikasi username & password, mengembalikan short-lived Access Token (5m) dan menyetel httpOnly Refresh Token cookie (7d).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login berhasil' },
          401: { description: 'Username atau password salah' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Silent Refresh Access Token',
        description:
          'Membaca httpOnly cookie refreshToken, melakukan rotasi token di database, dan mengembalikan Access Token baru (5 menit).',
        responses: {
          200: { description: 'Token berhasil diperbarui' },
          401: { description: 'Sesi kedaluwarsa atau token tidak valid' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout pengguna & pencabutan sesi',
        description: 'Menghapus refreshToken dari database dan membersihkan cookie browser.',
        responses: { 200: { description: 'Logout berhasil' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Mendapatkan profil pengguna aktif',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profil pengguna' },
          401: { description: 'Sesi tidak terautentikasi' },
        },
      },
    },
    '/api/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Ganti password pengguna aktif',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                  oldPassword: { type: 'string', example: 'admin123' },
                  newPassword: { type: 'string', example: 'newsecret123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password berhasil diubah' } },
      },
    },

    // User Management (RBAC - Kepala Bengkel Only)
    '/api/users': {
      get: {
        tags: ['User Management (RBAC)'],
        summary: 'Daftar semua akun pengguna (Kepala Bengkel)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Daftar pengguna' },
          403: { description: 'Akses ditolak (Khusus Kepala Bengkel)' },
        },
      },
      post: {
        tags: ['User Management (RBAC)'],
        summary: 'Tambah akun pengguna baru (Kepala Bengkel)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password', 'nama', 'role'],
                properties: {
                  username: { type: 'string', example: 'sa_andi' },
                  password: { type: 'string', example: 'password123' },
                  nama: { type: 'string', example: 'Andi Pratama' },
                  email: { type: 'string', example: 'andi@bengkelku.id' },
                  role: {
                    type: 'string',
                    enum: ['ADMIN', 'MEKANIK', 'KEPALA_BENGKEL'],
                    example: 'ADMIN',
                  },
                  mechanicId: { type: 'integer', nullable: true, example: null },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Akun berhasil dibuat' } },
      },
    },
    '/api/users/{id}': {
      put: {
        tags: ['User Management (RBAC)'],
        summary: 'Perbarui data akun pengguna (Kepala Bengkel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Akun berhasil diperbarui' } },
      },
      delete: {
        tags: ['User Management (RBAC)'],
        summary: 'Hapus akun pengguna (Kepala Bengkel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Akun berhasil dihapus' } },
      },
    },
    '/api/users/{id}/toggle-status': {
      patch: {
        tags: ['User Management (RBAC)'],
        summary: 'Aktifkan / Nonaktifkan status akun pengguna',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Status akun berhasil diubah' } },
      },
    },

    // Services (PKB & Antrean)
    '/api/services': {
      get: {
        tags: ['Services (PKB & Antrean)'],
        summary: 'Daftar antrean servis & PKB',
        description:
          'Jika login sebagai MEKANIK, data otomatis terfilter hanya untuk servis yang ditugaskan kepadanya.',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Daftar servis' } },
      },
      post: {
        tags: ['Services (PKB & Antrean)'],
        summary: 'Pendaftaran servis baru & pembuatan PKB (Reception SA)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'PKB berhasil dibuat' } },
      },
    },
    '/api/services/{id}/status': {
      patch: {
        tags: ['Services (PKB & Antrean)'],
        summary: 'Pembaruan status servis, penugasan teknisi & Audit QC (Tahap 4)',
        description:
          'Digunakan untuk mengubah status (Menunggu -> Dikerjakan -> Selesai). Saat status diubah ke Selesai, payload `qcData` disertakan untuk merekam audit kendali mutu (Quality Control).',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['Menunggu', 'Dikerjakan', 'Selesai'],
                    example: 'Selesai',
                  },
                  mechanicName: { type: 'string', example: 'Asep Hidayat' },
                  allowBusyOverride: { type: 'boolean', example: false },
                  qcData: {
                    type: 'object',
                    description: 'Data checklist audit kendali mutu (Quality Control) Tahap 4',
                    properties: {
                      kelistrikan_ok: { type: 'boolean', example: true },
                      rem_ok: { type: 'boolean', example: true },
                      gas_ok: { type: 'boolean', example: true },
                      test_ride_ok: { type: 'boolean', example: true },
                      part_bekas_diserahkan: { type: 'boolean', example: true },
                      catatan: {
                        type: 'string',
                        example: 'Semua fungsi kelistrikan dan pengereman normal.',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status servis berhasil diperbarui dan data QC tersimpan' },
          400: { description: 'Validasi gagal (misal: mekanik sibuk atau payload tidak valid)' },
          404: { description: 'Servis atau mekanik tidak ditemukan' },
        },
      },
    },

    // Stage 3: Service Items (Part Requisition & Approvals)
    '/api/services/{id}/items': {
      get: {
        tags: ['Service Items (Stage 3)'],
        summary: 'Daftar rincian part & jasa pada PKB',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Daftar item PKB' } },
      },
      post: {
        tags: ['Service Items (Stage 3)'],
        summary: 'Pengajuan permintaan part dari gudang atau jasa ekstra',
        description: 'Mengecek ketersediaan stok gudang secara otomatis sebelum part dialokasikan.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['itemType'],
                properties: {
                  itemType: { type: 'string', enum: ['SPAREPART', 'JASA'], example: 'SPAREPART' },
                  sparepartId: { type: 'integer', example: 1 },
                  serviceMasterId: { type: 'integer', nullable: true, example: null },
                  quantity: { type: 'integer', example: 1 },
                  approvalStatus: {
                    type: 'string',
                    enum: ['MENUNGGU_KONFIRMASI', 'DISETUJUI', 'DITOLAK'],
                    example: 'MENUNGGU_KONFIRMASI',
                  },
                  catatan: { type: 'string', example: 'Kampas rem tipis' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Item berhasil ditambahkan ke PKB' } },
      },
    },
    '/api/services/{id}/items/{itemId}': {
      patch: {
        tags: ['Service Items (Stage 3)'],
        summary: 'Ubah kuantitas atau status persetujuan konsumen (Disetujui / Ditolak)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Item berhasil diperbarui' } },
      },
      delete: {
        tags: ['Service Items (Stage 3)'],
        summary: 'Hapus item pengerjaan dari PKB',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Item berhasil dihapus' } },
      },
    },

    // Master Data Endpoints
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
    '/api/vehicles/search': {
      get: {
        tags: ['Vehicles'],
        summary: 'Cari kendaraan berdasarkan nomor polisi (Nopol)',
        parameters: [{ name: 'nopol', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
    // Stage 5: Transactions & POS Kasir
    '/api/transactions/unpaid': {
      get: {
        tags: ['Transactions & POS (Stage 5)'],
        summary: 'Daftar PKB yang sudah Selesai (Lulus QC) dan siap dibayar di kasir',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Daftar antrean PKB siap bayar berhasil diambil',
          },
        },
      },
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions & POS (Stage 5)'],
        summary: 'Riwayat transaksi invoice kasir dengan filter pencarian',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari nomor invoice, nopol, atau nama konsumen' },
          { name: 'metodeBayar', in: 'query', schema: { type: 'string' }, description: 'Filter metode bayar (Tunai, QRIS, dll)' },
        ],
        responses: {
          200: { description: 'Riwayat transaksi kasir berhasil diambil' },
        },
      },
      post: {
        tags: ['Transactions & POS (Stage 5)'],
        summary: 'Proses pembayaran kasir & pengurangan stok sparepart atomik',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['serviceId', 'metodeBayar'],
                properties: {
                  serviceId: { type: 'integer', example: 1 },
                  metodeBayar: { type: 'string', example: 'Tunai' },
                  diskon: { type: 'number', example: 5000 },
                  uangDiterima: { type: 'number', example: 150000 },
                  catatan: { type: 'string', example: 'Pembayaran kasir loket 1' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pembayaran kasir sukses & invoice dibuat' },
          400: { description: 'Validasi gagal, nominal tunai kurang, atau stok tidak cukup' },
          404: { description: 'PKB tidak ditemukan' },
        },
      },
    },
    '/api/transactions/{id}': {
      get: {
        tags: ['Transactions & POS (Stage 5)'],
        summary: 'Detail data transaksi invoice untuk cetak struk / faktur',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Detail invoice berhasil diambil' },
          404: { description: 'Invoice tidak ditemukan' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
