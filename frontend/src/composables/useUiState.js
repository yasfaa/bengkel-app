import { computed, ref } from 'vue';

export function useUiState() {
  const activeMenu = ref('dashboard');
  const menus = [
    { id: 'dashboard', name: 'Dashboard', icon: 'ph-chart-bar' },
    { id: 'servis', name: 'Antrean & PKB', icon: 'ph-wrench' },
    { id: 'transaksi', name: 'Transaksi & Kasir', icon: 'ph-receipt' },
    { id: 'stok', name: 'Stok Sparepart', icon: 'ph-package' },
    { id: 'mekanik', name: 'Mekanik', icon: 'ph-users-three' },
  ];

  const searchQuery = ref('');
  const errorMessage = ref('');
  const toastMessage = ref('');
  let toastTimer = null;

  const showToast = (message, duration = 3000) => {
    toastMessage.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.value = '';
    }, duration);
  };

  const clearToast = () => {
    toastMessage.value = '';
    if (toastTimer) clearTimeout(toastTimer);
  };

  const activeMenuName = computed(() => {
    const menu = menus.find((item) => item.id === activeMenu.value);
    return menu ? menu.name : 'BengkelKu';
  });

  return {
    activeMenu,
    menus,
    activeMenuName,
    searchQuery,
    errorMessage,
    toastMessage,
    showToast,
    clearToast,
  };
}
