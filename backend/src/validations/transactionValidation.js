const { z } = require('zod');

const createTransactionSchema = z.object({
  serviceId: z
    .number({ required_error: 'ID Servis (PKB) wajib disertakan' })
    .int()
    .positive('ID Servis tidak valid'),
  metodeBayar: z
    .string({ required_error: 'Metode pembayaran wajib dipilih' })
    .min(1, 'Metode pembayaran tidak boleh kosong'),
  diskon: z
    .number({ invalid_type_error: 'Diskon harus berupa angka' })
    .min(0, 'Diskon tidak boleh negatif')
    .optional()
    .default(0),
  uangDiterima: z
    .number({ invalid_type_error: 'Nominal uang diterima harus berupa angka' })
    .min(0, 'Nominal uang diterima tidak boleh negatif')
    .optional()
    .default(0),
  catatan: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable(),
});

module.exports = {
  createTransactionSchema,
};
