import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  // In-Memory state (Strictly NOT stored in localStorage for XSS immunity)
  const accessToken = ref('');
  const user = ref(null);
  const isInitializing = ref(true);
  const isLoading = ref(false);

  /* =========================================================================
     Computed / Getters
     ========================================================================= */
  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));
  const role = computed(() => user.value?.role || null);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isMechanic = computed(() => user.value?.role === 'MEKANIK');
  const isKepalaBengkel = computed(() => user.value?.role === 'KEPALA_BENGKEL');
  const displayName = computed(() => user.value?.nama || user.value?.username || 'Pengguna');

  /* =========================================================================
     Actions
     ========================================================================= */
  /**
   * Initialize authentication on app launch by checking httpOnly refresh cookie
   */
  const initAuth = async () => {
    isInitializing.value = true;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        accessToken.value = data.data.accessToken;
        user.value = data.data.user;
      } else {
        accessToken.value = '';
        user.value = null;
      }
    } catch {
      accessToken.value = '';
      user.value = null;
    } finally {
      isInitializing.value = false;
    }
  };

  /**
   * User login with username & password
   */
  const login = async (username, password) => {
    isLoading.value = true;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Login gagal. Periksa username dan password.'
        );
      }

      accessToken.value = data.data.accessToken;
      user.value = data.data.user;
      return data.data;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * User logout and session revocation
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}),
        },
        credentials: 'include',
      });
    } catch {
      // Silent ignore on logout network errors
    } finally {
      accessToken.value = '';
      user.value = null;
    }
  };

  /**
   * Update in-memory access token (used by silent refresh interceptor)
   */
  const setToken = (token) => {
    accessToken.value = token;
  };

  /**
   * Set user profile
   */
  const setUser = (userData) => {
    user.value = userData;
  };

  return {
    accessToken,
    user,
    isInitializing,
    isLoading,
    isAuthenticated,
    role,
    isAdmin,
    isMechanic,
    isKepalaBengkel,
    displayName,
    initAuth,
    login,
    logout,
    setToken,
    setUser,
  };
});
