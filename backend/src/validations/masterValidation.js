const { z } = require('zod');

// 1. Service Master Schemas
const createServiceMasterSchema = z.object({
  nama: z
    .string({ required_error: 'Nama jasa servis wajib diisi.' })
    .trim()
    .min(2, 'Nama jasa servis minimal 2 karakter.'),
  harga: z.coerce
    .number({ required_error: 'Harga jasa servis wajib diisi.' })
    .min(0, 'Harga tidak boleh bernilai negatif.'),
  deskripsi: z.string().trim().optional().nullable(),
  estimasi_durasi: z.coerce.number().min(1, 'Estimasi durasi minimal 1 menit.').optional(),
  kategori: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

const updateServiceMasterSchema = createServiceMasterSchema.partial();

// 2. Sparepart Schemas
const createSparepartSchema = z.object({
  kode_part: z
    .string({ required_error: 'Kode part (SKU) wajib diisi.' })
    .trim()
    .min(2, 'Kode part minimal 2 karakter.'),
  nama: z
    .string({ required_error: 'Nama suku cadang wajib diisi.' })
    .trim()
    .min(2, 'Nama suku cadang minimal 2 karakter.'),
  kategori: z.string().trim().optional(),
  stok: z.coerce.number().min(0, 'Stok tidak boleh negatif.').optional(),
  min_stok: z.coerce.number().min(0, 'Minimal stok tidak boleh negatif.').optional(),
  harga_beli: z.coerce.number().min(0, 'Harga beli tidak boleh negatif.').optional(),
  harga_jual: z.coerce.number().min(0, 'Harga jual tidak boleh negatif.').optional(),
  supplier_id: z.coerce.number().optional().nullable(),
});

const updateSparepartSchema = createSparepartSchema.partial();

// 3. Supplier Schemas
const createSupplierSchema = z.object({
  nama: z
    .string({ required_error: 'Nama supplier wajib diisi.' })
    .trim()
    .min(2, 'Nama supplier minimal 2 karakter.'),
  telepon: z.string().trim().optional().nullable(),
  alamat: z.string().trim().optional().nullable(),
});

const updateSupplierSchema = createSupplierSchema.partial();

// 4. Brand Schemas
const createBrandSchema = z.object({
  nama: z
    .string({ required_error: 'Nama merk motor wajib diisi.' })
    .trim()
    .min(2, 'Nama merk minimal 2 karakter.'),
});

const updateBrandSchema = createBrandSchema.partial();

// 5. Motor Type Schemas
const createTypeSchema = z
  .object({
    nama: z
      .string({ required_error: 'Nama tipe motor wajib diisi.' })
      .trim()
      .min(2, 'Nama tipe minimal 2 karakter.'),
    brand_id: z.coerce.number().optional(),
    brandId: z.coerce.number().optional(),
    jenis: z.string().trim().optional(),
    engine_capacity_id: z.coerce.number().optional().nullable(),
    capacityId: z.coerce.number().optional().nullable(),
  })
  .refine((data) => data.brand_id !== undefined || data.brandId !== undefined, {
    message: 'brand_id atau brandId wajib diisi.',
    path: ['brand_id'],
  });

const updateTypeSchema = z.object({
  nama: z.string().trim().min(2, 'Nama tipe minimal 2 karakter.').optional(),
  brand_id: z.coerce.number().optional(),
  brandId: z.coerce.number().optional(),
  jenis: z.string().trim().optional(),
  engine_capacity_id: z.coerce.number().optional().nullable(),
  capacityId: z.coerce.number().optional().nullable(),
});

// 6. Engine Capacity Schemas
const createCapacitySchema = z.object({
  kapasitas: z
    .string({ required_error: 'Kapasitas mesin wajib diisi.' })
    .trim()
    .min(2, 'Kapasitas mesin minimal 2 karakter.'),
});

const updateCapacitySchema = createCapacitySchema.partial();

module.exports = {
  createServiceMasterSchema,
  updateServiceMasterSchema,
  createSparepartSchema,
  updateSparepartSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createBrandSchema,
  updateBrandSchema,
  createTypeSchema,
  updateTypeSchema,
  createCapacitySchema,
  updateCapacitySchema,
};
