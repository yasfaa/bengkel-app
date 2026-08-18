const { z } = require('zod');

const createMechanicSchema = z.object({
  nama: z.string({ required_error: 'Nama mekanik wajib diisi.' }).trim().min(2, 'Nama mekanik minimal 2 karakter.'),
  waktu_kerja: z.string().trim().optional(),
  waktuKerja: z.string().trim().optional(),
  spesialisasi: z.string().trim().optional(),
  tgl_lahir: z.union([z.string(), z.date()]).optional(),
  tglLahir: z.union([z.string(), z.date()]).optional(),
  is_active: z.boolean().optional(),
});

const updateMechanicSchema = createMechanicSchema.partial();

module.exports = {
  createMechanicSchema,
  updateMechanicSchema,
};
