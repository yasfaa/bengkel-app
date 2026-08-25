import { useAuthStore } from '../stores/authStore';

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

/**
 * Execute silent refresh against /api/auth/refresh
 */
async function performSilentRefresh(authStore) {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      authStore.logout();
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.data.accessToken;
    authStore.setToken(newAccessToken);
    if (data.data.user) {
      authStore.setUser(data.data.user);
    }
    return newAccessToken;
  } catch {
    authStore.logout();
    return null;
  }
}

/**
 * Central fetch wrapper with automatic Authorization headers & silent 401 retry
 */
export async function apiFetch(url, options = {}) {
  let authStore = null;
  try {
    authStore = useAuthStore();
  } catch {
    // AuthStore not yet initialized (e.g. before Pinia setup)
  }

  // If authStore is still initializing on page refresh and has no token, await initialization first
  if (
    authStore &&
    authStore.isInitializing &&
    !authStore.accessToken &&
    url !== '/api/auth/refresh' &&
    url !== '/api/auth/login'
  ) {
    await authStore.initAuth();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authStore && authStore.accessToken) {
    headers.Authorization = `Bearer ${authStore.accessToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  let res = await fetch(url, config);

  // If 401 Unauthorized received, attempt silent refresh via httpOnly refresh cookie
  if (res.status === 401 && url !== '/api/auth/login' && url !== '/api/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await performSilentRefresh(authStore);
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        // Retry original request with new token
        headers.Authorization = `Bearer ${newToken}`;
        return fetch(url, { ...config, headers });
      }
    } else {
      // Queue incoming requests while refresh is underway
      const retryOriginal = new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          headers.Authorization = `Bearer ${newToken}`;
          resolve(fetch(url, { ...config, headers }));
        });
      });
      res = await retryOriginal;
    }
  }

  return res;
}

export async function apiGet(url) {
  const res = await apiFetch(url, { method: 'GET' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal mengambil data dari server.');
  }
  return res.json();
}

export async function apiPost(url, data) {
  const res = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal menyimpan data ke server.');
  }
  return res.status === 204 ? null : res.json();
}

export async function apiPatch(url, data) {
  const res = await apiFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal memperbarui data di server.');
  }
  return res.status === 204 ? null : res.json();
}

export async function apiPut(url, data) {
  const res = await apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal memperbarui data di server.');
  }
  return res.status === 204 ? null : res.json();
}

export async function apiDelete(url) {
  const res = await apiFetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Gagal menghapus data dari server.');
  }
  return true;
}
