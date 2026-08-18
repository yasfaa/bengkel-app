import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUiStore } from '../src/stores/uiStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import { useQueueStore } from '../src/stores/queueStore';
import { useMasterStore } from '../src/stores/masterStore';

describe('Pinia State Management Stores Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('useUiStore should manage navigation and notifications state', () => {
    const ui = useUiStore();
    expect(ui.activeMenu).toBe('dashboard');
    expect(ui.activeMenuName).toBe('Dashboard & Antrean');

    ui.activeMenu = 'servis';
    expect(ui.activeMenuName).toBe('Penerimaan Servis (PKB)');

    ui.showToast('Test Toast Notification');
    expect(ui.toastMessage).toBe('Test Toast Notification');

    ui.clearToast();
    expect(ui.toastMessage).toBe('');
  });

  it('useTransactionStore should calculate revenue and total invoice accurately', () => {
    const master = useMasterStore();
    const transactions = useTransactionStore();

    master.serviceMasters = [
      { id: 1, nama: 'Servis Ringan', harga: 50000, is_active: true },
    ];
    master.spareparts = [
      { id: 10, nama: 'Oli MPX2', hargaJual: 52000, stok: 10 },
    ];

    transactions.invoiceForm.serviceMasterId = 1;
    transactions.invoiceForm.sparepartId = 10;

    expect(transactions.selectedServiceMaster).not.toBeNull();
    expect(transactions.selectedServiceMaster.harga).toBe(50000);
    expect(transactions.selectedSparepart).not.toBeNull();
    expect(transactions.selectedSparepart.hargaJual).toBe(52000);
    expect(transactions.calculatedTotalInvoice).toBe(102000);
  });

  it('useQueueStore should filter active and completed services', () => {
    const queue = useQueueStore();
    queue.services = [
      { id: 1, nopol: 'B 1234 ABC', status: 'Menunggu', customerName: 'Budi' },
      { id: 2, nopol: 'B 5678 DEF', status: 'Dikerjakan', customerName: 'Siti' },
      { id: 3, nopol: 'B 9999 GHI', status: 'Selesai', customerName: 'Asep' },
    ];

    expect(queue.activeServices.length).toBe(2);
    expect(queue.activeServices.map((s) => s.id)).toEqual([1, 2]);
  });
});
