<template>
  <!-- 1. Initializing Splash Screen -->
  <div v-if="authStore.isInitializing" class="splash-screen">
    <div class="splash-content">
      <WrenchlyLogo
        :emblem-size="56"
        :is-stacked="true"
        custom-title-size="28px"
        custom-tagline-size="12px"
      />
      <p style="margin-top: 14px; font-size: 13px; color: #94a3b8">
        Memverifikasi sesi keamanan...
      </p>
    </div>
  </div>

  <!-- 2. Login View (If not authenticated) -->
  <LoginView v-else-if="!authStore.isAuthenticated" @login-success="handleLoginSuccess" />

  <!-- 3. Authenticated Enterprise Dashboard Layout -->
  <div v-else class="app-container">
    <!-- Enterprise Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <WrenchlyLogo :emblem-size="34" custom-title-size="19px" custom-tagline-size="9.5px" />
      </div>
      <nav>
        <ul class="sidebar-menu">
          <li
            v-for="menu in menus"
            :key="menu.id"
            :class="['sidebar-item', { active: activeMenu === menu.id }]"
            @click="activeMenu = menu.id"
          >
            <i :class="['ph-fill', menu.icon]"></i>
            <span>{{ menu.name }}</span>
            <span
              v-if="menu.id === 'servis' && activeServices.length > 0"
              class="badge badge-working"
              style="margin-left: auto; padding: 2px 7px; font-size: 11px"
            >
              {{ activeServices.length }}
            </span>
            <span
              v-if="menu.id === 'stok' && lowStockCount > 0"
              class="badge badge-error"
              style="margin-left: auto; padding: 2px 7px; font-size: 11px"
            >
              {{ lowStockCount }}
            </span>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="content-area">
      <header class="topbar-section">
        <div>
          <div class="breadcrumbs">Wrenchly / {{ activeMenuName }}</div>
          <h1 class="page-title">{{ activeMenuName }}</h1>
        </div>

        <div style="display: flex; align-items: center; gap: 12px">
          <!-- User Role Badge & Profile -->
          <div class="user-badge">
            <i :class="getRoleHeaderIcon(authStore.role)"></i>
            <span>{{ authStore.displayName }}</span>
            <span
              class="badge"
              :class="getRoleHeaderBadge(authStore.role)"
              style="font-size: 10.5px; margin-left: 4px"
            >
              {{ formatRoleHeader(authStore.role) }}
            </span>
          </div>

          <!-- Logout Button -->
          <button
            class="btn btn-secondary btn-sm"
            style="padding: 7px 12px; font-size: 12.5px; border-radius: 8px"
            title="Keluar dari Sistem"
            @click="handleLogout"
          >
            <i class="ph-bold ph-sign-out"></i>
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <!-- Global Error Banner -->
      <div v-if="errorMessage" class="error-banner">
        <div class="error-banner-content">
          <i class="ph-bold ph-warning-circle"></i>
          <span>{{ errorMessage }}</span>
        </div>
        <button class="btn btn-secondary" @click="retryAllData">Coba Lagi</button>
      </div>

      <!-- Active View Content -->
      <main>
        <component
          :is="activeViewComponent"
          :search-query="searchQuery"
          :services="services"
          :filtered-services="filteredServices"
          :active-services="activeServices"
          :mechanics="mechanics"
          :service-masters="serviceMasters"
          :suppliers="suppliers"
          :transactions="transactions"
          :unpaid-services="unpaidServices"
          :unpaid-count="unpaidCount"
          :filtered-transactions="filteredTransactions"
          :payment-method-filter="paymentMethodFilter"
          :spareparts="spareparts"
          :total-revenue="totalRevenue"
          :standby-mechanics-count="standbyMechanicsCount"
          :low-stock-count="lowStockCount"
          :format-currency="formatCurrency"
          :get-status-badge-class="getStatusBadgeClass"
          :get-mechanic-status="getMechanicStatus"
          :get-mechanic-active-job="getMechanicActiveJob"
          @update:search-query="searchQuery = $event"
          @open-service-modal="openAddServiceModal"
          @open-pkb-modal="openPkbModal"
          @open-part-modal="openPartModal"
          @open-stock-modal="openAddStockModal"
          @open-service-master-modal="openServiceMasterModal"
          @edit-service-master="editServiceMaster"
          @delete-service-master="deleteServiceMaster"
          @open-mechanic-modal="openMechanicModal"
          @edit-mechanic="editMechanic"
          @delete-mechanic="deleteMechanic"
          @open-sparepart-modal="openSparepartModal"
          @edit-sparepart="editSparepart"
          @delete-sparepart="deleteSparepart"
          @assign-mechanic="openAssignModal"
          @start-service-mechanic="startServiceMechanic"
          @complete-service="completeService"
          @open-payment-modal="openPaymentModal"
          @view-receipt="viewReceipt"
          @fetch-transactions="fetchTransactions"
          @fetch-unpaid-services="fetchUnpaidServices"
        />
      </main>
    </div>

    <!-- Modals -->
    <AddServiceModal
      v-model="showAddServiceModal"
      :form="newServiceForm"
      :brands="motorBrands"
      :types="motorTypes"
      :capacities="engineCapacities"
      :service-masters="serviceMasters"
      :mechanics="mechanics"
      :motor-type-loading="motorTypeLoading"
      @submit="saveNewService"
    />

    <PkbDetailModal
      v-model="showPkbModal"
      :service="selectedPkb"
      :format-currency="formatCurrency"
      :get-status-badge-class="getStatusBadgeClass"
    />

    <AssignMechanicModal
      v-model="showAssignModal"
      :service="selectedServiceForAssign"
      :mechanics="mechanics"
      :get-mechanic-status="getMechanicStatus"
      :get-mechanic-active-job="getMechanicActiveJob"
      :format-currency="formatCurrency"
      @confirm="confirmAssignMechanic"
    />

    <PartRequisitionModal v-model="showPartModal" :service="selectedServiceForPart" />

    <ServiceQcModal
      v-model="showQcModal"
      :service="selectedServiceForQc"
      @confirm="confirmCompleteService"
    />

    <InvoiceModal
      v-model="showInvoiceModal"
      :selected-service="selectedService"
      :payment-form="paymentForm"
      :total-jasa="totalJasa"
      :total-sparepart="totalSparepart"
      :grand-total="grandTotal"
      :kembalian="kembalian"
      :is-cash-deficit="isCashDeficit"
      :is-submitting="isSubmitting"
      :format-currency="formatCurrency"
      @submit="submitPayment"
    />

    <InvoiceReceiptModal
      v-model="showReceiptModal"
      :invoice="activeInvoice"
      :format-currency="formatCurrency"
    />

    <AddStockModal
      v-model="showAddStockModal"
      :form="stockForm"
      :spareparts="spareparts"
      :suppliers="suppliers"
      @submit="saveStockIn"
    />

    <ServiceMasterModal
      v-model="showServiceMasterModal"
      :form="serviceMasterForm"
      :selected-service-master="selectedServiceMaster"
      @submit="saveServiceMaster"
    />

    <MechanicModal v-model="showMechanicModal" :form="mechanicForm" @submit="saveMechanic" />

    <SparepartModal
      v-model="showSparepartModal"
      :selected-sparepart="selectedSparepart"
      :form="sparepartForm"
      :suppliers="suppliers"
      @submit="saveSparepart"
    />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast-notification" @click="clearToast">
        <i class="ph-bold ph-check-circle" style="color: #4ade80"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from './stores/authStore';
import { useBengkelApp } from './composables/useBengkelApp';
import WrenchlyLogo from './components/WrenchlyLogo.vue';
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import ExecutiveDashboardView from './views/ExecutiveDashboardView.vue';
import ServisView from './views/ServisView.vue';
import TransaksiView from './views/TransaksiView.vue';
import StokView from './views/StokView.vue';
import MekanikView from './views/MekanikView.vue';
import UserManagementView from './views/UserManagementView.vue';
import AddServiceModal from './components/AddServiceModal.vue';
import PkbDetailModal from './components/PkbDetailModal.vue';
import AssignMechanicModal from './components/AssignMechanicModal.vue';
import PartRequisitionModal from './components/PartRequisitionModal.vue';
import AddStockModal from './components/AddStockModal.vue';
import InvoiceModal from './components/InvoiceModal.vue';
import InvoiceReceiptModal from './components/InvoiceReceiptModal.vue';
import ServiceMasterModal from './components/ServiceMasterModal.vue';
import MechanicModal from './components/MechanicModal.vue';
import SparepartModal from './components/SparepartModal.vue';
import ServiceQcModal from './components/ServiceQcModal.vue';

const authStore = useAuthStore();

const {
  activeMenu,
  menus,
  activeMenuName,
  activeServices,
  services,
  mechanics,
  motorBrands,
  motorTypes,
  engineCapacities,
  serviceMasters,
  suppliers,
  transactions,
  unpaidServices,
  unpaidCount,
  spareparts,
  searchQuery,
  paymentMethodFilter,
  filteredTransactions,
  filteredServices,
  lowStockCount,
  standbyMechanicsCount,
  totalRevenue,
  getMechanicStatus,
  getMechanicActiveJob,
  getStatusBadgeClass,
  formatCurrency,
  completeService,
  openAddServiceModal,
  openAddStockModal,
  openServiceMasterModal,
  openPkbModal,
  showPkbModal,
  selectedPkb,
  showAssignModal,
  selectedServiceForAssign,
  openAssignModal,
  confirmAssignMechanic,
  startServiceMechanic,
  showPartModal,
  selectedServiceForPart,
  openPartModal,
  showQcModal,
  selectedServiceForQc,
  confirmCompleteService,
  editServiceMaster,
  deleteServiceMaster,
  showAddServiceModal,
  showAddStockModal,
  showInvoiceModal,
  showReceiptModal,
  selectedService,
  activeInvoice,
  paymentForm,
  totalJasa,
  totalSparepart,
  grandTotal,
  kembalian,
  isCashDeficit,
  isSubmitting,
  openPaymentModal,
  submitPayment,
  viewReceipt,
  fetchTransactions,
  fetchUnpaidServices,
  selectedSparepart,
  selectedServiceMaster,
  stockForm,
  newServiceForm,
  serviceMasterForm,
  saveNewService,
  saveStockIn,
  showServiceMasterModal,
  saveServiceMaster,
  openMechanicModal,
  editMechanic,
  deleteMechanic,
  saveMechanic,
  showMechanicModal,
  mechanicForm,
  openSparepartModal,
  editSparepart,
  deleteSparepart,
  saveSparepart,
  showSparepartModal,
  sparepartForm,
  motorTypeLoading,
  errorMessage,
  retryAllData,
  toastMessage,
  clearToast,
} = useBengkelApp();

onMounted(() => {
  authStore.initAuth();
});

const handleLoginSuccess = () => {
  retryAllData();
};

const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Konfirmasi Keluar',
    text: 'Apakah Anda yakin ingin keluar dari sesi Wrenchly?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  });

  if (result.isConfirmed) {
    await authStore.logout();
  }
};

const formatRoleHeader = (role) => {
  if (role === 'ADMIN') return 'SA / Admin';
  if (role === 'MEKANIK') return 'Mekanik';
  if (role === 'KEPALA_BENGKEL') return 'Kepala Bengkel';
  return role || 'Tamu';
};

const getRoleHeaderIcon = (role) => {
  if (role === 'ADMIN') return 'ph-fill ph-user-gear';
  if (role === 'MEKANIK') return 'ph-fill ph-wrench';
  if (role === 'KEPALA_BENGKEL') return 'ph-fill ph-briefcase';
  return 'ph-fill ph-user-circle';
};

const getRoleHeaderBadge = (role) => {
  if (role === 'ADMIN') return 'badge-primary';
  if (role === 'MEKANIK') return 'badge-working';
  if (role === 'KEPALA_BENGKEL') return 'badge-secondary';
  return 'badge-primary';
};

const activeViewComponent = computed(() => {
  if (activeMenu.value === 'dashboard') {
    return authStore.isKepalaBengkel ? ExecutiveDashboardView : DashboardView;
  }

  const viewMap = {
    dashboard: authStore.isKepalaBengkel ? ExecutiveDashboardView : DashboardView,
    servis: ServisView,
    transaksi: TransaksiView,
    stok: StokView,
    mekanik: MekanikView,
    users: UserManagementView,
  };

  return (
    viewMap[activeMenu.value] ||
    (authStore.isKepalaBengkel ? ExecutiveDashboardView : DashboardView)
  );
});
</script>

<style scoped>
.splash-screen {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #ffffff;
}

.splash-content {
  text-align: center;
}

.splash-badge {
  width: 60px;
  height: 60px;
  background: #2563eb;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 16px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}
</style>
