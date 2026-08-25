import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PartRequisitionModal from '../src/components/PartRequisitionModal.vue';

describe('PartRequisitionModal Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const sampleService = {
    id: 15,
    nomorPkb: 'PKB-20260821-002',
    nopol: 'D 5678 ABC',
    motorType: 'Yamaha NMAX (155cc)',
    customerName: 'Siti Rahma',
    phone: '081298765432',
    keluhan: 'Kuras radiator dan ganti kampas',
    serviceMasterId: 2,
    servicePackageName: 'Servis Berkala',
    estimasiBiaya: 125000,
    status: 'Dikerjakan',
    serviceItems: [
      {
        id: 101,
        itemType: 'SPAREPART',
        sparepartId: 1,
        kodePart: 'KMP-DEP-01',
        namaItem: 'Kampas Rem Depan',
        quantity: 1,
        hargaSatuan: 45000,
        subtotal: 45000,
        approvalStatus: 'MENUNGGU_KONFIRMASI',
        isApproved: false,
        catatan: 'Kampas aus',
      },
    ],
  };

  it('should render Part Requisition Modal with correct service details and items', () => {
    const wrapper = mount(PartRequisitionModal, {
      props: {
        modelValue: true,
        service: sampleService,
      },
    });

    expect(wrapper.text()).toContain('Item Pengerjaan & Permintaan Suku Cadang');
    expect(wrapper.text()).toContain('PKB-20260821-002');
    expect(wrapper.text()).toContain('D 5678 ABC');
    expect(wrapper.text()).toContain('Servis Berkala');
    expect(wrapper.text()).toContain('125.000');
    expect(wrapper.text()).toContain('Kampas Rem Depan');
    expect(wrapper.text()).toContain('KMP-DEP-01');
    expect(wrapper.text()).toContain('Menunggu Konfirmasi');
    expect(wrapper.text()).toContain('TOTAL ESTIMASI TAGIHAN PKB');
  });

  it('should not render modal when modelValue is false', () => {
    const wrapper = mount(PartRequisitionModal, {
      props: {
        modelValue: false,
        service: sampleService,
      },
    });

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });
});
