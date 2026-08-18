<template>
  <div class="app-container">
    <!-- Enterprise Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class="ph-bold ph-wrench"></i>
        <span>BengkelKu</span>
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
              style="margin-left: auto; padding: 2px 7px; font-size: 11px;"
            >
              {{ activeServices.length }}
            </span>
            <span
              v-if="menu.id === 'stok' && lowStockCount > 0"
              class="badge badge-error"
              style="margin-left: auto; padding: 2px 7px; font-size: 11px;"
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
          <div class="breadcrumbs">BengkelKu / {{ activeMenuName }}</div>
          <h1 class="page-title">{{ activeMenuName }}</h1>
        </div>
        <div class="user-badge">
          <i class="ph-fill ph-user-circle"></i>
          <span>Service Advisor / Kasir</span>
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
          @assign-mechanic="assignMechanic"
          @complete-service="completeService"
          @create-invoice="createInvoice"
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

    <InvoiceModal
      v-model="showInvoiceModal"
      :selected-service="selectedService"
      :invoice-form="invoiceForm"
      :service-masters="serviceMasters"
      :spareparts="spareparts"
      :selected-sparepart="selectedSparepart"
      :selected-service-master="selectedServiceMaster"
      :calculated-total-invoice="calculatedTotalInvoice"
      :format-currency="formatCurrency"
      @submit="processPayment"
    />

    <AddStockModal
      v-model="showAddStockModal"
      :stock-form="stockForm"
      :spareparts="spareparts"
      @submit="saveStockIn"
    />

    <ServiceMasterModal
      v-model="showServiceMasterModal"
      :form="serviceMasterForm"
      @submit="saveServiceMaster"
    />

    <MechanicModal
      v-model="showMechanicModal"
      :form="mechanicForm"
      @submit="saveMechanic"
    />

    <SparepartModal
      v-model="showSparepartModal"
      :form="sparepartForm"
      :suppliers="suppliers"
      @submit="saveSparepart"
    />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast-notification" @click="clearToast">
        <i class="ph-bold ph-check-circle" style="color: #4ade80;"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useBengkelApp } from './composables/useBengkelApp';
import DashboardView from './views/DashboardView.vue';
import ServisView from './views/ServisView.vue';
import TransaksiView from './views/TransaksiView.vue';
import StokView from './views/StokView.vue';
import MekanikView from './views/MekanikView.vue';
import AddServiceModal from './components/AddServiceModal.vue';
import PkbDetailModal from './components/PkbDetailModal.vue';
import AddStockModal from './components/AddStockModal.vue';
import InvoiceModal from './components/InvoiceModal.vue';
import ServiceMasterModal from './components/ServiceMasterModal.vue';
import MechanicModal from './components/MechanicModal.vue';
import SparepartModal from './components/SparepartModal.vue';

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
  spareparts,
  searchQuery,
  filteredServices,
  lowStockCount,
  standbyMechanicsCount,
  totalRevenue,
  getMechanicStatus,
  getMechanicActiveJob,
  getStatusBadgeClass,
  formatCurrency,
  assignMechanic,
  completeService,
  openAddServiceModal,
  openAddStockModal,
  openServiceMasterModal,
  openPkbModal,
  printPkb,
  showPkbModal,
  selectedPkb,
  editServiceMaster,
  deleteServiceMaster,
  showAddServiceModal,
  showAddStockModal,
  showInvoiceModal,
  selectedService,
  selectedSparepart,
  selectedServiceMaster,
  calculatedTotalInvoice,
  invoiceForm,
  stockForm,
  newServiceForm,
  serviceMasterForm,
  processPayment,
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
  createInvoice,
  motorTypeLoading,
  errorMessage,
  retryAllData,
  toastMessage,
  showToast,
  clearToast,
} = useBengkelApp();

const activeViewComponent = computed(() => {
  const viewMap = {
    dashboard: DashboardView,
    servis: ServisView,
    transaksi: TransaksiView,
    stok: StokView,
    mekanik: MekanikView,
  };

  return viewMap[activeMenu.value] || DashboardView;
});
</script>