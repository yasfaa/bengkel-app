import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import MekanikView from '../src/views/MekanikView.vue';
import { useAuthStore } from '../src/stores/authStore';

describe('MekanikView.vue Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockMechanics = [
    {
      id: 1,
      nama: 'Asep Hidayat',
      spesialisasi: 'Mesin & CVT',
      masaKerja: '3 Tahun',
      waktuKerja: 'Full-time',
      tglMasuk: '2023-01-15',
    },
    {
      id: 2,
      nama: 'Bambang Sudiro',
      spesialisasi: 'Kelistrikan & Injeksi',
      masaKerja: '1 Tahun',
      waktuKerja: 'Full-time',
      tglMasuk: '2025-06-10',
    },
  ];

  it('1. should render mechanic cards with specialization and work status', () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'ADMIN', nama: 'Admin SA' });

    const wrapper = mount(MekanikView, {
      props: {
        mechanics: mockMechanics,
        getMechanicStatus: (name) => (name === 'Asep Hidayat' ? 'Bekerja' : 'Standby'),
        getMechanicActiveJob: (name) => (name === 'Asep Hidayat' ? 'B 1234 ABC' : null),
      },
    });

    expect(wrapper.text()).toContain('Asep Hidayat');
    expect(wrapper.text()).toContain('Mesin & CVT');
    expect(wrapper.text()).toContain('Bekerja');
    expect(wrapper.text()).toContain('Bambang Sudiro');
    expect(wrapper.text()).toContain('Siap Ambil Servis');
  });

  it('2. should show Tambah Teknisi and Edit/Delete buttons for Kepala Bengkel', async () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'KEPALA_BENGKEL', nama: 'Kepala Bengkel' });

    const wrapper = mount(MekanikView, {
      props: {
        mechanics: mockMechanics,
        getMechanicStatus: () => 'Standby',
        getMechanicActiveJob: () => null,
      },
    });

    expect(wrapper.text()).toContain('Tambah Teknisi Baru');

    const editBtn = wrapper.find('.btn-secondary');
    expect(editBtn.exists()).toBe(true);
    await editBtn.trigger('click');
    expect(wrapper.emitted('edit-mechanic')).toBeTruthy();

    const deleteBtn = wrapper.find('.btn-danger');
    expect(deleteBtn.exists()).toBe(true);
    await deleteBtn.trigger('click');
    expect(wrapper.emitted('delete-mechanic')).toBeTruthy();
  });
});
