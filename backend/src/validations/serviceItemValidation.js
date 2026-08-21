const { z } = require('zod');

const addServiceItemSchema = z
  .object({
    itemType: z.enum(['SPAREPART', 'JASA'], {
      required_error: 'Tipe item wajib diisi (SPAREPART atau JASA).',
    }),
    sparepartId: z.union([z.number(), z.string()]).optional().nullable(),
    serviceMasterId: z.union([z.number(), z.string()]).optional().nullable(),
    quantity: z.coerce.number().int().min(1, 'Jumlah minimal 1 unit.').default(1),
    approvalStatus: z
      .enum(['MENUNGGU_KONFIRMASI', 'DISETUJUI', 'DITOLAK'])
      .optional()
      .default('MENUNGGU_KONFIRMASI'),
    isApproved: z.boolean().optional(),
    catatan: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.itemType === 'SPAREPART') {
        return !!data.sparepartId;
      }
      if (data.itemType === 'JASA') {
        return !!data.serviceMasterId;
      }
      return true;
    },
    {
      message: 'ID suku cadang atau ID jasa harus disertakan sesuai tipe item.',
      path: ['sparepartId'],
    }
  );

const updateServiceItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Jumlah minimal 1 unit.').optional(),
  approvalStatus: z.enum(['MENUNGGU_KONFIRMASI', 'DISETUJUI', 'DITOLAK']).optional(),
  isApproved: z.boolean().optional(),
  catatan: z.string().trim().optional().nullable(),
});

module.exports = {
  addServiceItemSchema,
  updateServiceItemSchema,
};
