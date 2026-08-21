import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExecutiveDashboardView from '../src/views/ExecutiveDashboardView.vue';
import ExecutiveRevenueRecap from '../src/components/executive/ExecutiveRevenueRecap.vue';
import ExecutiveInventoryRecap from '../src/components/executive/ExecutiveInventoryRecap.vue';

describe('Executive Dashboard & Recap Components Tests', () => {
  const sampleServices = [
    {
      id: 1,
      nomorPkb: 'PKB-001',
      nopol: 'B 1234 ABC',
      customerName: 'Budi Test',
      motorType: 'Honda Vario (160cc)',
      keluhan: 'Ganti oli',
      mechanicName: 'Asep Hidayat',
      status: 'Dikerjakan',
      isPaid: false,
    },
    {
      id: 2,
      nomorPkb: 'PKB-002',
      nopol: 'B 5678 DEF',
      customerName: 'Ani Test',
      motorType: 'Yamaha NMAX (155cc)',
      keluhan: 'Tune up',
      mechanicName: 'Asep Hidayat',
      status: 'Selesai',
      isPaid: true,
    },
  ];

  const sampleMechanics = [
    { id: 1, nama: 'Asep Hidayat', spesialisasi: 'Mesin & CVT', masaKerja: '2 tahun' },
    { id: 2, nama: 'Budi Santoso', spesialisasi: 'Kelistrikan', masaKerja: '1 tahun' },
  ];

  const sampleTransactions = [
    {
      id: 1,
      nomorInvoice: 'INV-001',
      totalBayar: 150000,
      metodePembayaran: 'TUNAI',
      status: 'LUNAS',
    },
    {
      id: 2,
      nomorInvoice: 'INV-002',
      totalBayar: 200000,
      metodePembayaran: 'QRIS',
      status: 'LUNAS',
    },
  ];

  const sampleSpareparts = [
    {
      id: 1,
      kode_part: 'KMP-01',
      nama: 'Kampas Rem',
      harga_beli: 30000,
      harga_jual: 45000,
      stok: 2,
      min_stok: 5,
    },
    {
      id: 2,
      kode_part: 'OLI-01',
      nama: 'Oli Mesin MPX',
      harga_beli: 40000,
      harga_jual: 60000,
      stok: 20,
      min_stok: 5,
    },
  ];

  it('should render ExecutiveDashboardView with all recap sections', () => {
    const wrapper = mount(ExecutiveDashboardView, {
      props: {
        services: sampleServices,
        mechanics: sampleMechanics,
        transactions: sampleTransactions,
        spareparts: sampleSpareparts,
        totalRevenue: 350000,
        standbyMechanicsCount: 1,
        lowStockCount: 1,
        getMechanicStatus: (name) => (name === 'Asep Hidayat' ? 'Bekerja' : 'Standby'),
        getMechanicActiveJob: (name) => (name === 'Asep Hidayat' ? 'B 1234 ABC' : null),
      },
    });

    expect(wrapper.text()).toContain('Executive Dashboard & Rekapitulasi Operasional');
    expect(wrapper.text()).toContain('Rp 350.000');
    expect(wrapper.text()).toContain('Kampas Rem');
  });

  it('should calculate revenue breakdown correctly in ExecutiveRevenueRecap', () => {
    const wrapper = mount(ExecutiveRevenueRecap, {
      props: {
        transactions: sampleTransactions,
        totalRevenue: 350000,
      },
    });

    expect(wrapper.text()).toContain('Rekap Keuangan & Metode Pembayaran');
    expect(wrapper.text()).toContain('TUNAI');
    expect(wrapper.text()).toContain('QRIS');
  });

  it('should list critical items requiring restock in ExecutiveInventoryRecap', () => {
    const wrapper = mount(ExecutiveInventoryRecap, {
      props: {
        spareparts: sampleSpareparts,
      },
    });

    expect(wrapper.text()).toContain('Peringatan Stok Kritis (ROP)');
    expect(wrapper.text()).toContain('Kampas Rem');
    expect(wrapper.text()).toContain('1 Item Kritis');
  });
});
