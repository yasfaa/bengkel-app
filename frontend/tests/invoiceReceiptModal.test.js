import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InvoiceReceiptModal from '../src/components/InvoiceReceiptModal.vue';

describe('🧾 InvoiceReceiptModal & Stage 6 Warranty Tests', () => {
  const mockInvoice = {
    id: 99,
    noInvoice: 'INV-260825-001',
    nopol: 'B 1234 ABC',
    customerName: 'Ahmad Dahlan',
    phone: '081234567890',
    total: 125000,
    totalJasa: 50000,
    totalSparepart: 75000,
    metodeBayar: 'Tunai',
    uangDiterima: 150000,
    kembalian: 25000,
    tglBayar: '2026-08-25T10:00:00.000Z',
    service: {
      basePackageName: 'Paket Servis Rutin',
      basePackagePrice: 50000,
      serviceItems: [
        {
          id: 1,
          namaItem: 'Oli Mesin MPX2',
          itemType: 'SPAREPART',
          quantity: 1,
          hargaSatuan: 75000,
          subtotal: 75000,
        },
      ],
    },
  };

  const defaultProps = {
    modelValue: true,
    invoice: mockInvoice,
    formatCurrency: (val) => Number(val).toLocaleString('id-ID'),
  };

  it('1. should render invoice metadata, itemized breakdown, and Stage 6 warranty card', () => {
    const wrapper = mount(InvoiceReceiptModal, { props: defaultProps });

    expect(wrapper.text()).toContain('INV-260825-001');
    expect(wrapper.text()).toContain('B 1234 ABC');
    expect(wrapper.text()).toContain('Ahmad Dahlan');
    expect(wrapper.text()).toContain('KETENTUAN GARANSI & SURAT JALAN');
    expect(wrapper.text()).toContain('7 Hari / 500 KM');
    expect(wrapper.text()).toContain('Lembar 1 (Putih)');
    expect(wrapper.text()).toContain('Lembar 2 (Merah/Kuning)');
    expect(wrapper.text()).toContain('Lembar 3 (Hijau/Biru)');
  });

  it('2. should generate correct WhatsApp notification URL for customer', () => {
    const wrapper = mount(InvoiceReceiptModal, { props: defaultProps });

    const waLink = wrapper.find('a[title*="WhatsApp"]');
    expect(waLink.exists()).toBe(true);
    const href = waLink.attributes('href');
    expect(href).toContain('https://wa.me/6281234567890');
    expect(href).toContain('INV-260825-001');
    expect(href).toContain('GARANSI');
  });

  it('3. should calculate 30 days / 1000 KM warranty for heavy / overhaul services', () => {
    const heavyInvoice = {
      ...mockInvoice,
      service: {
        ...mockInvoice.service,
        basePackageName: 'Servis Berat & Turun Mesin',
      },
    };

    const wrapper = mount(InvoiceReceiptModal, {
      props: {
        ...defaultProps,
        invoice: heavyInvoice,
      },
    });

    expect(wrapper.text()).toContain('30 Hari / 1000 KM');
  });
});
