import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', () => {
  const activeMenu = ref('dashboard');
  const searchQuery = ref('');
  const errorMessage = ref('');
  const toastMessage = ref('');
  let toastTimer = null;

  const menus = ref([
    { id: 'dashboard', name: 'Dashboard & Antrean', icon: 'ph-gauge' },
    { id: 'servis', name: 'Penerimaan Servis (PKB)', icon: 'ph-wrench' },
    { id: 'transaksi', name: 'Kasir & Billing', icon: 'ph-receipt' },
    { id: 'stok', name: 'Stok Suku Cadang', icon: 'ph-package' },
    { id: 'mekanik', name: 'Data Teknisi Mekanik', icon: 'ph-users-three' },
  ]);

  const activeMenuName = computed(() => {
    const found = menus.value.find((m) => m.id === activeMenu.value);
    return found ? found.name : 'Dashboard';
  });

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
