import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ServisView from '../src/views/ServisView.vue';
import { useAuthStore } from '../src/stores/authStore';

describe('ServisView.vue Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockServices = [
    {
      id: 1,
      nomorPkb: 'PKB-20260825-001',
      nopol: 'B 1234 ABC',
      motorType: 'Honda Vario 160',
      customerName: 'Budi Santoso',
      phone: '08123456789',
      kmMasuk: 12000,
      servicePackageName: 'Servis Ringan',
      keluhan: 'Ganti oli mesin',
      mechanicName: 'Asep Hidayat',
      status: 'Menunggu',
      isPaid: false,
      serviceItems: [{ id: 1, namaItem: 'Oli MPX2' }],
    },
    {
      id: 2,
      nomorPkb: 'PKB-20260825-002',
      nopol: 'B 5678 XYZ',
      motorType: 'Yamaha NMAX 155',
      customerName: 'Siti Aminah',
      phone: '08129998887',
      kmMasuk: 25000,
      servicePackageName: 'Servis Lengkap',
      keluhan: 'Getar di CVT',
      mechanicName: 'Asep Hidayat',
      status: 'Dikerjakan',
      isPaid: false,
      serviceItems: [],
    },
    {
      id: 3,
      nomorPkb: 'PKB-20260825-003',
      nopol: 'D 9999 KZX',
      motorType: 'Honda Beat',
      customerName: 'Doni Pratama',
      phone: '08127776665',
      kmMasuk: 5000,
      servicePackageName: 'Ganti Oli',
      keluhan: 'Oli rutin',
      mechanicName: 'Asep Hidayat',
      status: 'Selesai',
      isPaid: false,
      serviceItems: [],
    },
  ];

  it('1. should render table with service records and PKB numbers', () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'ADMIN', nama: 'Admin SA' });

    const wrapper = mount(ServisView, {
      props: {
        searchQuery: '',
        filteredServices: mockServices,
        getStatusBadgeClass: (st) => `badge-${st.toLowerCase()}`,
      },
    });

    expect(wrapper.text()).toContain('PKB-20260825-001');
    expect(wrapper.text()).toContain('B 1234 ABC');
    expect(wrapper.text()).toContain('Budi Santoso');
    expect(wrapper.text()).toContain('Yamaha NMAX 155');
  });

  it('2. should render Selesai button for Admin when service status is Dikerjakan', async () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'ADMIN', nama: 'Admin SA' });

    const wrapper = mount(ServisView, {
      props: {
        searchQuery: '',
        filteredServices: mockServices,
        getStatusBadgeClass: () => 'badge-working',
      },
    });

    const buttons = wrapper.findAll('button');
    const selesaiButton = buttons.find((b) => b.text().includes('Selesai'));
    expect(selesaiButton).toBeDefined();

    await selesaiButton.trigger('click');
    expect(wrapper.emitted('complete-service')).toBeTruthy();
    expect(wrapper.emitted('complete-service')[0][0]).toMatchObject({
      id: 2,
      status: 'Dikerjakan',
    });
  });

  it('3. should render Kasir button for Admin when service status is Selesai and not yet paid', async () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'ADMIN', nama: 'Admin SA' });

    const wrapper = mount(ServisView, {
      props: {
        searchQuery: '',
        filteredServices: mockServices,
        getStatusBadgeClass: () => 'badge-done',
      },
    });

    const buttons = wrapper.findAll('button');
    const kasirButton = buttons.find((b) => b.text().includes('Kasir'));
    expect(kasirButton).toBeDefined();

    await kasirButton.trigger('click');
    expect(wrapper.emitted('create-invoice')).toBeTruthy();
  });

  it('4. should only render Part & Jasa button for services that have started (Dikerjakan/Selesai)', async () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'ADMIN', nama: 'Admin SA' });

    const wrapper = mount(ServisView, {
      props: {
        searchQuery: '',
        filteredServices: mockServices,
        getStatusBadgeClass: () => 'badge-pending',
      },
    });

    const partButtons = wrapper.findAll('button').filter((b) => b.text().includes('Part & Jasa'));
    // Only id:2 (Dikerjakan) and id:3 (Selesai unpaid) have Part & Jasa button, not id:1 (Menunggu)
    expect(partButtons.length).toBe(2);

    await partButtons[0].trigger('click');
    expect(wrapper.emitted('open-part-modal')).toBeTruthy();
    expect(wrapper.emitted('open-part-modal')[0][0]).toMatchObject({ id: 2 });
  });

  it('5. should display empty state when filteredServices is empty', () => {
    const authStore = useAuthStore();
    authStore.setUser({ role: 'ADMIN', nama: 'Admin SA' });

    const wrapper = mount(ServisView, {
      props: {
        searchQuery: 'XYZ Not Found',
        filteredServices: [],
        getStatusBadgeClass: () => 'badge-pending',
      },
    });

    expect(wrapper.text()).toContain('Antrean servis tidak ditemukan');
  });
});
