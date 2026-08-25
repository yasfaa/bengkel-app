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
    const transactions = useTransactionStore();

    transactions.transactions = [
      { id: 1, total: 100000, tglBayar: new Date().toISOString() },
      { id: 2, total: 150000, tglBayar: new Date().toISOString() },
    ];

    expect(transactions.totalRevenue).toBe(250000);
    expect(transactions.todayRevenue).toBe(250000);

    transactions.selectedService = {
      id: 5,
      totalJasa: 50000,
      totalSparepart: 55000,
    };
    transactions.paymentForm.diskon = 5000;
    transactions.paymentForm.uangDiterima = 120000;

    expect(transactions.totalGross).toBe(105000);
    expect(transactions.grandTotal).toBe(100000);
    expect(transactions.kembalian).toBe(20000);
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

  it('useMasterStore should manage spareparts, services, and brands state', () => {
    const master = useMasterStore();
    master.brands = [{ id: 1, nama: 'Honda' }];
    master.serviceMasters = [{ id: 1, nama: 'Servis Ringan', harga: 50000 }];
    master.spareparts = [{ id: 1, nama: 'Oli Mesin MPX2', stok: 10, hargaJual: 75000 }];

    expect(master.brands.length).toBe(1);
    expect(master.serviceMasters[0].nama).toBe('Servis Ringan');
    expect(master.spareparts[0].stok).toBe(10);
  });
});
