import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';

const STORAGE_KEY = 'bengkelku_active_menu';

const getMenuFromHash = () => {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  return hash;
};

const getSavedMenu = () => {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const useUiStore = defineStore('ui', () => {
  const authStore = useAuthStore();
  const activeMenu = ref(getMenuFromHash() || getSavedMenu() || 'dashboard');
  const searchQuery = ref('');
  const errorMessage = ref('');
  const toastMessage = ref('');
  let toastTimer = null;

  const menus = computed(() => {
    const role = authStore.role;

    if (role === 'MEKANIK') {
      return [
        { id: 'servis', name: 'Tugas Servis Saya', icon: 'ph-wrench' },
        { id: 'stok', name: 'Katalog & Stok Sparepart', icon: 'ph-package' },
      ];
    }

    if (role === 'KEPALA_BENGKEL') {
      return [
        { id: 'dashboard', name: 'Executive Dashboard & Rekap', icon: 'ph-gauge' },
        { id: 'servis', name: 'Monitoring Antrean Servis', icon: 'ph-wrench' },
        { id: 'transaksi', name: 'Riwayat Transaksi & Omzet', icon: 'ph-receipt' },
        { id: 'mekanik', name: 'Manajemen Teknisi Mekanik', icon: 'ph-users-three' },
        { id: 'stok', name: 'Katalog & Stok Sparepart', icon: 'ph-package' },
        { id: 'users', name: 'Manajemen Pengguna (RBAC)', icon: 'ph-user-gear' },
      ];
    }

    // Default: ADMIN (Service Advisor / Frontdesk / Kasir)
    return [
      { id: 'dashboard', name: 'Dashboard & Antrean', icon: 'ph-gauge' },
      { id: 'servis', name: 'Penerimaan Servis (PKB)', icon: 'ph-wrench' },
      { id: 'transaksi', name: 'Kasir & Master Jasa', icon: 'ph-receipt' },
      { id: 'stok', name: 'Stok Suku Cadang', icon: 'ph-package' },
      { id: 'mekanik', name: 'Data Teknisi Mekanik', icon: 'ph-users-three' },
    ];
  });

  const activeMenuName = computed(() => {
    const found = menus.value.find((m) => m.id === activeMenu.value);
    return found ? found.name : 'Dashboard';
  });

  // Sync with localStorage and URL Hash
  watch(
    activeMenu,
    (newMenu) => {
      if (!newMenu) return;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, newMenu);
        }
      } catch {
        // Ignore storage errors
      }
      if (typeof window !== 'undefined' && getMenuFromHash() !== newMenu) {
        window.location.hash = `#/${newMenu}`;
      }
    },
    { immediate: true }
  );

  // Validate active menu when available menus change (e.g. role change)
  watch(
    menus,
    (availableMenus) => {
      if (!availableMenus || availableMenus.length === 0) return;
      const validIds = availableMenus.map((m) => m.id);
      if (!validIds.includes(activeMenu.value)) {
        activeMenu.value = validIds[0];
      }
    },
    { immediate: true }
  );

  // Listen to browser back / forward buttons
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
      const hashMenu = getMenuFromHash();
      const validIds = menus.value.map((m) => m.id);
      if (hashMenu && validIds.includes(hashMenu)) {
        activeMenu.value = hashMenu;
      }
    });
  }

  const showToast = (message, duration = 3000) => {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.value = message;
    toastTimer = setTimeout(() => {
      toastMessage.value = '';
      toastTimer = null;
    }, duration);
  };

  const clearToast = () => {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.value = '';
    toastTimer = null;
  };

  return {
    activeMenu,
    searchQuery,
    errorMessage,
    toastMessage,
    menus,
    activeMenuName,
    showToast,
    clearToast,
  };
});
