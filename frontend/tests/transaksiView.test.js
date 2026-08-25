import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/authStore';
import TransaksiView from '../src/views/TransaksiView.vue';

describe('💳 TransaksiView Component Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const authStore = useAuthStore();
    authStore.setUser({ id: 1, username: 'admin', role: 'ADMIN' });
  });

  const mockUnpaid = [
    {
      id: 201,
      nomorPkb: 'PKB-260825-001',
      nopol: 'B 7777 POS',
      customerName: 'Joko Widodo',
      motorType: 'Yamaha NMAX 155',
      mechanicName: 'Asep',
      totalJasa: 60000,
      totalSparepart: 85000,
      grandTotal: 145000,
      itemsCount: 2,
    },
  ];

  const mockTransactions = [
    {
      id: 1,
      noInvoice: 'INV-260825-001',
      nopol: 'B 1111 ABC',
      customerName: 'Budi Hartono',
      metodeBayar: 'Tunai',
      total: 120000,
      tglBayar: '2026-08-25T10:00:00.000Z',
    },
  ];

  const defaultProps = {
    serviceMasters: [{ id: 1, nama: 'Servis Ringan', harga: 50000, is_active: true }],
    transactions: mockTransactions,
    unpaidServices: mockUnpaid,
    unpaidCount: 1,
    totalRevenue: 120000,
    filteredTransactions: mockTransactions,
    searchQuery: '',
    paymentMethodFilter: '',
    fetchTransactions: () => {},
    fetchUnpaidServices: () => {},
  };

  it('1. should render unpaid services in Kasir tab and emit open-payment-modal', async () => {
    const wrapper = mount(TransaksiView, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('Antrean Pembayaran Kasir');
    expect(wrapper.text()).toContain('B 7777 POS');
    expect(wrapper.text()).toContain('Joko Widodo');
    expect(wrapper.text()).toContain('145.000');

    const payBtn = wrapper.findAll('button').find((b) => b.text().includes('Proses Bayar'));
    expect(payBtn).toBeDefined();

    await payBtn.trigger('click');
    expect(wrapper.emitted('open-payment-modal')).toBeTruthy();
    expect(wrapper.emitted('open-payment-modal')[0][0]).toEqual(mockUnpaid[0]);
  });

  it('2. should switch to Riwayat Transaksi tab and render transaction history', async () => {
    const wrapper = mount(TransaksiView, {
      props: defaultProps,
    });

    const historyTabBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Riwayat Transaksi'));
    expect(historyTabBtn).toBeDefined();

    await historyTabBtn.trigger('click');

    expect(wrapper.text()).toContain('Riwayat Transaksi Kasir');
    expect(wrapper.text()).toContain('INV-260825-001');
    expect(wrapper.text()).toContain('B 1111 ABC');
  });
});
