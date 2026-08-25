const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHandler');

class TransactionController {
  // POST /api/transactions
  createTransaction = asyncHandler(async (req, res) => {
    const result = await transactionService.createTransaction(req.body, req.user);
    res.status(201).json({
      status: 'success',
      message: 'Pembayaran kasir berhasil diproses dan invoice telah dibuat.',
      data: result,
    });
  });

  // GET /api/transactions
  getAllTransactions = asyncHandler(async (req, res) => {
    const transactions = await transactionService.getAllTransactions(req.query);
    res.status(200).json(transactions);
  });

  // GET /api/transactions/:id
  getTransactionById = asyncHandler(async (req, res) => {
    const transaction = await transactionService.getTransactionById(req.params.id);
    res.status(200).json(transaction);
  });

  // GET /api/transactions/unpaid
  getUnpaidServices = asyncHandler(async (req, res) => {
    const services = await transactionService.getUnpaidCompletedServices();
    res.status(200).json(services);
  });
}

module.exports = new TransactionController();
