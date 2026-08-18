const { z } = require('zod');

const searchVehicleQuerySchema = z.object({
  nopol: z.string({ required_error: 'Parameter nopol wajib diisi.' }).trim().min(1, 'Parameter nopol tidak boleh kosong.'),
});

module.exports = {
  searchVehicleQuerySchema,
};
