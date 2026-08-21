/**
 * Root Facade Composable for BengkelKu powered by Pinia Stores
 * Connects UI, Master Data, Queue/PKB, and Transactions Pinia Stores
 */
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '../stores/uiStore';
import { useMasterStore } from '../stores/masterStore';
import { useQueueStore } from '../stores/queueStore';
import { useTransactionStore } from '../stores/transactionStore';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

export function useBengkelApp() {
  const uiStore = useUiStore();
  const masterStore = useMasterStore();
  const queueStore = useQueueStore();
  const transactionStore = useTransactionStore();

  const uiRefs = storeToRefs(uiStore);
  const masterRefs = storeToRefs(masterStore);
  const queueRefs = storeToRefs(queueStore);
  const transactionRefs = storeToRefs(transactionStore);

  const fetchAllData = async () => {
    uiStore.errorMessage = '';
    try {
      await Promise.all([masterStore.fetchAllMasterData(), queueStore.fetchServices()]);
    } catch (e) {
      console.error('Error fetching all initial data:', e);
      uiStore.errorMessage = 'Gagal terhubung ke backend server. Periksa koneksi atau server.';
    }
  };

  const retryAllData = () => fetchAllData();

  onMounted(() => {
    fetchAllData();
  });

  return {
    // UI Store State & Actions
    ...uiRefs,
    showToast: uiStore.showToast,
    clearToast: uiStore.clearToast,
    retryAllData,
    formatCurrency,
    getStatusBadgeClass,

    // Master Store State & Actions
    ...masterRefs,
    fetchBrands: masterStore.fetchBrands,
    fetchMotorTypes: masterStore.fetchMotorTypes,
    fetchCapacities: masterStore.fetchCapacities,
    fetchServiceMasters: masterStore.fetchServiceMasters,
    fetchSuppliers: masterStore.fetchSuppliers,
    fetchSpareparts: masterStore.fetchSpareparts,
    fetchMechanics: masterStore.fetchMechanics,
    fetchAllMasterData: masterStore.fetchAllMasterData,
    openServiceMasterModal: masterStore.openServiceMasterModal,
    editServiceMaster: masterStore.editServiceMaster,
    deleteServiceMaster: masterStore.deleteServiceMaster,
    saveServiceMaster: masterStore.saveServiceMaster,
    openMechanicModal: masterStore.openMechanicModal,
    editMechanic: masterStore.editMechanic,
    deleteMechanic: masterStore.deleteMechanic,
    saveMechanic: masterStore.saveMechanic,
    openSparepartModal: masterStore.openSparepartModal,
    editSparepart: masterStore.editSparepart,
    deleteSparepart: masterStore.deleteSparepart,
    saveSparepart: masterStore.saveSparepart,

    // Queue Store State & Actions
    ...queueRefs,
    getMechanicStatus: queueStore.getMechanicStatus,
    getMechanicActiveJob: queueStore.getMechanicActiveJob,
    fetchServices: queueStore.fetchServices,
    openAddServiceModal: queueStore.openAddServiceModal,
    openPkbModal: queueStore.openPkbModal,
    openAssignModal: queueStore.openAssignModal,
    confirmAssignMechanic: queueStore.confirmAssignMechanic,
    printPkb: queueStore.printPkb,
    saveNewService: queueStore.saveNewService,
    assignMechanic: queueStore.assignMechanic,
    completeService: queueStore.completeService,

    // Transaction Store State & Actions
    ...transactionRefs,
    createInvoice: transactionStore.createInvoice,
    processPayment: transactionStore.processPayment,
    openAddStockModal: transactionStore.openAddStockModal,
    saveStockIn: transactionStore.saveStockIn,
  };
}
