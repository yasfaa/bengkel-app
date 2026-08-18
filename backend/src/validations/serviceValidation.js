const { z } = require('zod');

const NOPOL_REGEX = /^[A-Z]{1,2}\s?[0-9]{1,4}\s?[A-Z]{1,3}$/i;

const createServiceSchema = z.object({
  customerName: z.string({ required_error: 'Nama pelanggan wajib diisi.' }).trim().min(2, 'Nama pelanggan minimal 2 karakter.'),
  phone: z.string({ required_error: 'Nomor telepon wajib diisi.' }).trim().min(6, 'Nomor telepon / WA minimal 6 digit.'),
  nopol: z.string({ required_error: 'Nomor polisi wajib diisi.' }).trim().min(3, 'Nomor polisi minimal 3 karakter.'),
  keluhan: z.string({ required_error: 'Keluhan utama wajib diisi.' }).trim().min(3, 'Keluhan wajib diisi minimal 3 karakter.'),
  brandName: z.string().trim().optional().nullable(),
  typeName: z.string().trim().optional().nullable(),
  capacityName: z.string().trim().optional().nullable(),
  motorType: z.string().trim().optional().nullable(),
  jenis: z.string().trim().optional().nullable(),
  warna: z.string().trim().optional().nullable(),
  tahunPembuatan: z.union([z.number(), z.string()]).optional().nullable(),
  kmMasuk: z.union([z.number(), z.string()]).optional().nullable(),
  levelBensin: z.string().trim().optional().nullable(),
  catatanKondisi: z.string().trim().optional().nullable(),
  serviceMasterId: z.union([z.number(), z.string()]).optional().nullable(),
  estimasiBiaya: z.union([z.number(), z.string()]).optional().nullable(),
  estimasiDurasi: z.union([z.number(), z.string()]).optional().nullable(),
  mechanicName: z.string().trim().optional().nullable(),
  initialStatus: z.enum(['Menunggu', 'Dikerjakan', 'Selesai']).optional(),
});

const updateServiceStatusSchema = z.object({
  status: z.enum(['Menunggu', 'Dikerjakan', 'Selesai', 'Lunas'], {
    errorMap: () => ({ message: 'Status harus salah satu dari: Menunggu, Dikerjakan, Selesai, Lunas.' }),
  }).optional(),
  mechanicName: z.string().trim().optional().nullable(),
  allowBusyOverride: z.boolean().optional(),
});

module.exports = {
  createServiceSchema,
  updateServiceStatusSchema,
};
