const { z } = require('zod');

const createMechanicSchema = z.object({
  nama: z
    .string({ required_error: 'Nama mekanik wajib diisi.' })
    .trim()
    .min(2, 'Nama mekanik minimal 2 karakter.'),
  spesialisasi: z.string().trim().optional(),
  tgl_lahir: z.union([z.string(), z.date()]).optional(),
  tglLahir: z.union([z.string(), z.date()]).optional(),
  tgl_masuk: z.union([z.string(), z.date()]).optional(),
  tglMasuk: z.union([z.string(), z.date()]).optional(),
  waktu_kerja: z.string().trim().optional(),
  waktuKerja: z.string().trim().optional(),
  userId: z.union([z.string(), z.number()]).optional(),
  is_active: z.boolean().optional(),
});

const updateMechanicSchema = createMechanicSchema.partial();

module.exports = {
  createMechanicSchema,
  updateMechanicSchema,
};
