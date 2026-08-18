/**
 * Root Facade Composable for BengkelKu
 * Aggregates modular domain composables (UI, Master Data, Queue/PKB, and Transactions)
 */
import { onMounted } from 'vue';
import { useUiState } from './useUiState';
import { useMasterData } from './useMasterData';
import { useQueueService } from './useQueueService';
import { useTransactions } from './useTransactions';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

export function useBengkelApp() {
  // 1. UI Navigation & Notifications State
  const ui = useUiState();

  // 2. Master Data & Catalog CRUD
  const master = useMasterData(ui);

  // 3. Service Queue & PKB Operations
  const queue = useQueueService(master, ui);

  // 4. Invoicing, Billing & Stock Transactions
  const transactions = useTransactions(master, queue, ui);

  // Initial Data Fetch
  const fetchAllData = async () => {
    ui.errorMessage.value = '';
    try {
      await Promise.all([
        master.fetchAllMasterData(),
        queue.fetchServices(),
      ]);
    } catch (e) {
      console.error(e);
      ui.errorMessage.value = 'Gagal terhubung ke backend server. Periksa koneksi atau server.';
    }
  };

  const retryAllData = () => fetchAllData();

  onMounted(() => {
    fetchAllData();
  });

  return {
    // UI & Navigation
    ...ui,
    retryAllData,
    formatCurrency,
    getStatusBadgeClass,

    // Master Data
    ...master,

    // Queue & PKB
    ...queue,

    // Billing & Transactions
    ...transactions,
  };
}