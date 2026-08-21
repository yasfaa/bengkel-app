const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().trim().min(3, 'Username minimal 3 karakter.'),
  password: z.string().min(4, 'Password minimal 4 karakter.'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(4, 'Password lama wajib diisi.'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter.'),
});

const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter.')
    .max(30, 'Username maksimal 30 karakter.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  nama: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.'),
  email: z.string().trim().email('Format email tidak valid.').optional().nullable(),
  role: z.enum(['ADMIN', 'MEKANIK', 'KEPALA_BENGKEL'], {
    required_error: 'Role akun wajib ditentukan (ADMIN, MEKANIK, KEPALA_BENGKEL).',
  }),
  mechanicId: z.coerce.number().int().positive().optional().nullable(),
});

const updateUserSchema = z.object({
  nama: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.').optional(),
  email: z.string().trim().email('Format email tidak valid.').optional().nullable(),
  role: z.enum(['ADMIN', 'MEKANIK', 'KEPALA_BENGKEL']).optional(),
  mechanicId: z.coerce.number().int().positive().optional().nullable(),
  password: z.string().min(6, 'Password baru minimal 6 karakter.').optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
};
