import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import UserManagementView from '../src/views/UserManagementView.vue';
import { useAuthStore } from '../src/stores/authStore';
import * as api from '../src/utils/api';

describe('UserManagementView.vue Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      nama: 'Budi (Admin SA)',
      email: 'admin@bengkelku.id',
      role: 'ADMIN',
      isActive: true,
      mechanicName: null,
    },
    {
      id: 2,
      username: 'asep',
      nama: 'Asep Hidayat',
      email: 'asep@bengkelku.id',
      role: 'MEKANIK',
      isActive: true,
      mechanicName: 'Asep Hidayat',
    },
    {
      id: 3,
      username: 'kepala',
      nama: 'Pak Haji (Kepala)',
      email: 'kepala@bengkelku.id',
      role: 'KEPALA_BENGKEL',
      isActive: true,
      mechanicName: null,
    },
  ];

  it('1. should render users table with role badges and active user indicator', async () => {
    vi.spyOn(api, 'apiGet').mockResolvedValue({ data: mockUsers });

    const authStore = useAuthStore();
    authStore.setUser({ id: 3, username: 'kepala', role: 'KEPALA_BENGKEL' });

    const wrapper = mount(UserManagementView);
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain('Manajemen Akun Pengguna (RBAC)');
    expect(wrapper.text()).toContain('Budi (Admin SA)');
    expect(wrapper.text()).toContain('Asep Hidayat');
    expect(wrapper.text()).toContain('(Akun Anda Saat Ini)');
  });

  it('2. should open create user modal when Tambah Akun Baru button is clicked', async () => {
    vi.spyOn(api, 'apiGet').mockResolvedValue({ data: mockUsers });

    const wrapper = mount(UserManagementView);
    await wrapper.vm.$nextTick();

    const addBtn = wrapper.find('.btn-primary');
    await addBtn.trigger('click');

    expect(wrapper.text()).toContain('Tambah Akun Pengguna Baru');
    expect(wrapper.find('input[placeholder="Misal: sa_budi"]').exists()).toBe(true);
  });

  it('3. should disable delete/toggle buttons on own active user account', async () => {
    vi.spyOn(api, 'apiGet').mockResolvedValue({ data: mockUsers });

    const authStore = useAuthStore();
    authStore.setUser({ id: 1, username: 'admin', role: 'KEPALA_BENGKEL' });

    const wrapper = mount(UserManagementView);
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(3);

    // Row 1 is user 1 (the active user). It should NOT have toggle/delete buttons
    const row1Buttons = rows[0].findAll('button');
    // Only edit button should be rendered for own account
    expect(row1Buttons.length).toBe(1);

    // Row 2 is user 2 (another account). It should have edit, toggle, and delete buttons (3 buttons)
    const row2Buttons = rows[1].findAll('button');
    expect(row2Buttons.length).toBe(3);
  });
});
