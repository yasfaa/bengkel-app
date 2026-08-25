import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AssignMechanicModal from '../src/components/AssignMechanicModal.vue';

describe('AssignMechanicModal.vue Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockService = {
    id: 101,
    nomorPkb: 'PKB-20260825-001',
    nopol: 'B 1234 ABC',
    motorType: 'Honda Vario 160 (160 cc)',
    customerName: 'Budi Santoso',
    phone: '08123456789',
    status: 'Menunggu',
    keluhan: 'Ganti oli dan servis rem',
    servicePackageName: 'Servis Ringan',
    estimasiBiaya: 50000,
    mechanicName: null,
  };

  const mockMechanics = [
    { id: 1, nama: 'Asep Hidayat', spesialisasi: 'Mesin & CVT', is_active: true },
    { id: 2, nama: 'Bambang', spesialisasi: 'Kelistrikan & Injeksi', is_active: true },
  ];

  it('1. should render modal with PKB metadata when modelValue is true', () => {
    const wrapper = mount(AssignMechanicModal, {
      props: {
        modelValue: true,
        service: mockService,
        mechanics: mockMechanics,
        getMechanicStatus: (name) => (name === 'Asep Hidayat' ? 'Standby' : 'Bekerja'),
        getMechanicActiveJob: (name) => (name === 'Bambang' ? 'B 9999 XYZ (Doni)' : null),
      },
    });

    expect(wrapper.text()).toContain('Alokasi Pit & Penugasan Teknisi');
    expect(wrapper.text()).toContain('PKB-20260825-001');
    expect(wrapper.text()).toContain('B 1234 ABC');
    expect(wrapper.text()).toContain('Asep Hidayat');
    expect(wrapper.text()).toContain('Bambang');
  });

  it('2. should allow selecting Pit bay option', async () => {
    const wrapper = mount(AssignMechanicModal, {
      props: {
        modelValue: true,
        service: mockService,
        mechanics: mockMechanics,
        getMechanicStatus: () => 'Standby',
        getMechanicActiveJob: () => null,
      },
    });

    const pitButtons = wrapper.findAll('.brand-pill-btn');
    expect(pitButtons.length).toBe(4);

    // Click Pit 2
    await pitButtons[1].trigger('click');
    expect(pitButtons[1].classes()).toContain('active');
  });

  it('3. should select mechanic and emit confirm with startWorking=false on Assign Only', async () => {
    const wrapper = mount(AssignMechanicModal, {
      props: {
        modelValue: true,
        service: mockService,
        mechanics: mockMechanics,
        getMechanicStatus: () => 'Standby',
        getMechanicActiveJob: () => null,
      },
    });

    const mechanicCards = wrapper.findAll('.mechanic-select-card');
    await mechanicCards[0].trigger('click');
    expect(mechanicCards[0].classes()).toContain('active');

    // Click Tugaskan Saja button
    const assignButtons = wrapper.findAll('button');
    const assignOnlyBtn = assignButtons.find((b) => b.text().includes('Tugaskan Saja'));
    expect(assignOnlyBtn).toBeDefined();

    await assignOnlyBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      mechanicName: 'Asep Hidayat',
      startWorking: false,
    });
  });

  it('4. should show error banner when attempting to assign without selecting a mechanic', async () => {
    const wrapper = mount(AssignMechanicModal, {
      props: {
        modelValue: true,
        service: { ...mockService, mechanicName: '' },
        mechanics: mockMechanics,
        getMechanicStatus: () => 'Standby',
        getMechanicActiveJob: () => null,
      },
    });

    const assignButtons = wrapper.findAll('button');
    const assignOnlyBtn = assignButtons.find((b) => b.text().includes('Tugaskan Saja'));
    await assignOnlyBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toBeFalsy();
    expect(wrapper.text()).toContain('Harap pilih teknisi pelaksana');
  });
});
