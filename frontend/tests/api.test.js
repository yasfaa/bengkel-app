import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { apiGet, apiPost, apiPatch, apiPut, apiDelete, apiFetch } from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';

describe('api.js Fetch Wrapper & Interceptor Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('1. should inject Authorization Bearer header when user has accessToken', async () => {
    const authStore = useAuthStore();
    authStore.setToken('test_access_token_123');

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'OK' }),
    });

    const result = await apiGet('/api/test');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_access_token_123',
        }),
      })
    );
    expect(result).toEqual({ status: 'OK' });
  });

  it('2. should format POST body as JSON string and return response data', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 42, name: 'Item Test' }),
    });

    const payload = { name: 'Item Test' };
    const result = await apiPost('/api/items', payload);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual({ id: 42, name: 'Item Test' });
  });

  it('3. should throw meaningful error when API returns non-ok status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Data tidak valid' }),
    });

    await expect(apiGet('/api/bad-request')).rejects.toThrow('Data tidak valid');
  });

  it('4. should handle DELETE requests and return true on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const result = await apiDelete('/api/items/1');
    expect(result).toBe(true);
  });
});
