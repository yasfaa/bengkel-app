import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PkbDetailModal from '../src/components/PkbDetailModal.vue';

describe('PkbDetailModal Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  const sampleService = {
    id: 10,
    nomorPkb: 'PKB-20260819-001',
    nopol: 'B 1234 XYZ',
    motorType: 'Honda Beat (110cc)',
    customerName: 'Ahmad Fauzi',
    phone: '081234567890',
    keluhan: 'Tarikan berat dan ganti oli',
    warna: 'Hitam',
    tahunPembuatan: 2022,
    kmMasuk: 15000,
    levelBensin: 'Full',
    catatanKondisi: 'Bodi mulus',
    servicePackageName: 'Servis Ringan',
    estimasiBiaya: 50000,
    mechanicName: 'Asep',
    mechanicSpecialization: 'Mesin & CVT',
    status: 'Menunggu',
    tgl_masuk: '2026-08-19T08:00:00Z',
  };

  it('should render PKB official document with correct customer and vehicle information', () => {
    const wrapper = mount(PkbDetailModal, {
      props: {
        modelValue: true,
        service: sampleService,
      },
    });

    expect(wrapper.text()).toContain('PKB-20260819-001');
    expect(wrapper.text()).toContain('B 1234 XYZ');
    expect(wrapper.text()).toContain('Ahmad Fauzi');
    expect(wrapper.text()).toContain('Honda Beat (110cc)');
    expect(wrapper.text()).toContain('Tarikan berat dan ganti oli');
    expect(wrapper.text()).toContain('Asep');
    expect(wrapper.text()).toContain('SURAT PERINTAH KERJA (PKB)');
  });

  it('should not render anything when modelValue is false', () => {
    const wrapper = mount(PkbDetailModal, {
      props: {
        modelValue: false,
        service: sampleService,
      },
    });

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });
});
