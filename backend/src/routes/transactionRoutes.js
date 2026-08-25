const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validate');
const { createTransactionSchema } = require('../validations/transactionValidation');

// Global optional authentication for read operations
router.use(authMiddleware.optional);

// GET /api/transactions/unpaid - Daftar PKB selesai siap bayar
router.get(
  '/unpaid',
  roleMiddleware(['ADMIN', 'KEPALA_BENGKEL']),
  transactionController.getUnpaidServices
);

// GET /api/transactions & POST /api/transactions
router
  .route('/')
  .get(transactionController.getAllTransactions)
  .post(
    roleMiddleware(['ADMIN', 'KEPALA_BENGKEL']),
    validate(createTransactionSchema),
    transactionController.createTransaction
  );

// GET /api/transactions/:id - Detail invoice & cetak struk
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
