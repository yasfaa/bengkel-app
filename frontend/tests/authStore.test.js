import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/authStore';
import { useUiStore } from '../src/stores/uiStore';

describe('AuthStore and Dynamic RBAC Navigation Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with empty in-memory credentials and isInitializing true', () => {
    const auth = useAuthStore();
    expect(auth.accessToken).toBe('');
    expect(auth.user).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.role).toBeNull();
  });

  it('should compute role getters correctly when authenticated', () => {
    const auth = useAuthStore();
    auth.setToken('mock_access_token_123');
    auth.setUser({
      id: 1,
      username: 'admin',
      nama: 'Budi (SA)',
      role: 'ADMIN',
    });

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.isAdmin).toBe(true);
    expect(auth.isMechanic).toBe(false);
    expect(auth.isKepalaBengkel).toBe(false);
    expect(auth.displayName).toBe('Budi (SA)');
  });

  it('uiStore menus should filter correctly for MEKANIK role', () => {
    const auth = useAuthStore();
    const ui = useUiStore();

    auth.setUser({ id: 2, username: 'asep', role: 'MEKANIK' });

    expect(ui.menus.length).toBe(2);
    expect(ui.menus.map((m) => m.id)).toEqual(['servis', 'stok']);
  });

  it('uiStore menus should filter correctly for KEPALA_BENGKEL role', () => {
    const auth = useAuthStore();
    const ui = useUiStore();

    auth.setUser({ id: 3, username: 'kepala', role: 'KEPALA_BENGKEL' });

    expect(ui.menus.map((m) => m.id)).toEqual([
      'dashboard',
      'servis',
      'transaksi',
      'mekanik',
      'stok',
      'users',
    ]);
  });

  it('should reset tokens and user on logout', async () => {
    const auth = useAuthStore();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success' }),
    });

    auth.setToken('test_token');
    auth.setUser({ id: 1, username: 'admin', role: 'ADMIN' });

    await auth.logout();

    expect(auth.accessToken).toBe('');
    expect(auth.user).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });

  it('queueStore should filter services strictly for MEKANIK role', async () => {
    const { useQueueStore } = await import('../src/stores/queueStore');
    const auth = useAuthStore();
    const queue = useQueueStore();

    queue.services = [
      {
        id: 1,
        nomorPkb: 'PKB-01',
        nopol: 'B 1111 AAA',
        customerName: 'Joko',
        motorType: 'Vario',
        mechanicId: 1,
        mechanicName: 'Asep Hidayat',
        status: 'Dikerjakan',
      },
      {
        id: 2,
        nomorPkb: 'PKB-02',
        nopol: 'B 2222 BBB',
        customerName: 'Siti',
        motorType: 'Beat',
        mechanicId: 2,
        mechanicName: 'Budi Santoso',
        status: 'Dikerjakan',
      },
      {
        id: 3,
        nomorPkb: 'PKB-03',
        nopol: 'B 3333 CCC',
        customerName: 'Rian',
        motorType: 'NMAX',
        mechanicId: null,
        mechanicName: null,
        status: 'Menunggu',
      },
    ];

    // Case 1: When user is MEKANIK (Asep)
    auth.setUser({ id: 2, username: 'asep', nama: 'Asep Hidayat', role: 'MEKANIK', mechanicId: 1 });

    expect(queue.filteredServices.length).toBe(1);
    expect(queue.filteredServices[0].mechanicName).toBe('Asep Hidayat');

    // Case 2: When user is ADMIN
    auth.setUser({ id: 1, username: 'admin', role: 'ADMIN' });
    expect(queue.filteredServices.length).toBe(3);
  });
});
