import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InvoiceModal from '../src/components/InvoiceModal.vue';

describe('💳 InvoiceModal Component Unit Tests', () => {
  const mockService = {
    id: 1,
    nopol: 'B 3344 XYZ',
    customerName: 'Siti Rahma',
    motorType: 'Honda Vario 160',
    basePackageName: 'Paket Servis Rutin',
    basePackagePrice: 50000,
    approvedItems: [
      {
        id: 10,
        itemType: 'SPAREPART',
        namaItem: 'Oli Mesin MPX2',
        quantity: 1,
        hargaSatuan: 55000,
        subtotal: 55000,
      },
      {
        id: 11,
        itemType: 'JASA',
        namaItem: 'Kuras Minyak Rem',
        quantity: 1,
        hargaSatuan: 25000,
        subtotal: 25000,
      },
    ],
  };

  const defaultProps = {
    modelValue: true,
    selectedService: mockService,
    paymentForm: {
      serviceId: 1,
      metodeBayar: 'Tunai',
      diskon: 0,
      uangDiterima: 130000,
      catatan: '',
    },
    totalJasa: 75000,
    totalSparepart: 55000,
    grandTotal: 130000,
    kembalian: 0,
    isCashDeficit: false,
    isSubmitting: false,
    formatCurrency: (val) => Number(val).toLocaleString('id-ID'),
  };

  it('1. should render customer info, nopol, and itemized PKB breakdown', () => {
    const wrapper = mount(InvoiceModal, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('B 3344 XYZ');
    expect(wrapper.text()).toContain('Siti Rahma');
    expect(wrapper.text()).toContain('Paket Servis Rutin');
    expect(wrapper.text()).toContain('Oli Mesin MPX2');
    expect(wrapper.text()).toContain('Kuras Minyak Rem');
    expect(wrapper.text()).toContain('130.000');
  });

  it('2. should emit submit event when Process Bayar button is clicked', async () => {
    const wrapper = mount(InvoiceModal, {
      props: defaultProps,
    });

    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Proses Bayar'));
    expect(submitBtn).toBeDefined();

    await submitBtn.trigger('click');
    expect(wrapper.emitted('submit')).toBeTruthy();
  });
});
