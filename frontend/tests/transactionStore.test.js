import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTransactionStore } from '../src/stores/transactionStore';
import * as apiModule from '../src/utils/api';

vi.mock('../src/utils/swal', () => ({
  SwalConfirm: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
  SwalSuccess: { fire: vi.fn() },
}));

describe('💳 Frontend TransactionStore Unit Tests (Stage 5 POS)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('1. should calculate grand total, discount, and cash change correctly', () => {
    const store = useTransactionStore();

    store.selectedService = {
      id: 10,
      nopol: 'B 1234 ABC',
      customerName: 'Ahmad POS',
      totalJasa: 50000,
      totalSparepart: 40000,
      grandTotal: 90000,
    };

    store.paymentForm = {
      serviceId: 10,
      metodeBayar: 'Tunai',
      diskon: 10000,
      uangDiterima: 100000,
      catatan: 'Diskon promo',
    };

    expect(store.totalGross).toBe(90000);
    expect(store.grandTotal).toBe(80000); // 90.000 - 10.000
    expect(store.kembalian).toBe(20000); // 100.000 - 80.000
    expect(store.isCashDeficit).toBe(false);
  });

  it('2. should detect cash deficit when received amount is less than grand total', () => {
    const store = useTransactionStore();

    store.selectedService = {
      id: 10,
      totalJasa: 50000,
      totalSparepart: 40000,
    };

    store.paymentForm = {
      serviceId: 10,
      metodeBayar: 'Tunai',
      diskon: 0,
      uangDiterima: 70000, // Total is 90.000
    };

    expect(store.grandTotal).toBe(90000);
    expect(store.isCashDeficit).toBe(true);
    expect(store.kembalian).toBe(0);
  });

  it('3. should fetch unpaid completed services from API', async () => {
    const mockUnpaid = [
      {
        id: 101,
        nomorPkb: 'PKB-260825-001',
        nopol: 'B 8888 XYZ',
        grandTotal: 150000,
      },
    ];

    vi.spyOn(apiModule, 'apiGet').mockResolvedValueOnce(mockUnpaid);

    const store = useTransactionStore();
    await store.fetchUnpaidServices();

    expect(store.unpaidServices).toEqual(mockUnpaid);
    expect(store.unpaidCount).toBe(1);
  });

  it('4. should process cashier payment and open receipt modal', async () => {
    const createdTrx = {
      id: 55,
      noInvoice: 'INV-260825-001',
      total: 150000,
      metodeBayar: 'QRIS',
    };

    vi.spyOn(apiModule, 'apiPost').mockResolvedValueOnce({ status: 'success', data: createdTrx });
    vi.spyOn(apiModule, 'apiGet').mockResolvedValue([]);

    const store = useTransactionStore();
    store.selectedService = {
      id: 101,
      nopol: 'B 8888 XYZ',
      customerName: 'Budi',
      grandTotal: 150000,
    };

    store.paymentForm = {
      serviceId: 101,
      metodeBayar: 'QRIS',
      diskon: 0,
      uangDiterima: 150000,
    };

    await store.submitPayment();

    expect(store.showInvoiceModal).toBe(false);
    expect(store.showReceiptModal).toBe(true);
    expect(store.activeInvoice).toEqual(createdTrx);
  });

  it('5. should reject opening payment modal for already paid services', () => {
    const store = useTransactionStore();

    store.openPaymentModal({
      id: 200,
      nopol: 'B 9999 LUNAS',
      isPaid: true,
      grandTotal: 100000,
    });

    expect(store.showInvoiceModal).toBe(false);
  });
});
