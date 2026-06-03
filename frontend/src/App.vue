<template>
  <div class="app-container">
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
          </li>
        </ul>
      </nav>
    </aside>

    <div class="content-area">
      <div class="topbar-section">
        <div>
          <div class="breadcrumbs">BengkelKu / {{ activeMenuName }}</div>
          <h1 class="page-title">{{ activeMenuName }}</h1>
        </div>
        <div class="user-badge">
          <i class="ph-fill ph-user-circle"></i>
          <span>Kasir/Admin (V1)</span>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner">
        <div class="error-banner-content">
          <i class="ph-fill ph-warning-circle"></i>
          <span>{{ errorMessage }}</span>
        </div>
        <button class="btn btn-secondary" @click="retryAllData">Coba Lagi</button>
      </div>

      <main>
        <component
          :is="activeViewComponent"
          :search-query="searchQuery"
          :services="services"
          :filtered-services="filteredServices"
          :active-services="activeServices"
          :mechanics="mechanics"
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
          @open-stock-modal="openAddStockModal"
          @assign-mechanic="assignMechanic"
          @complete-service="completeService"
          @create-invoice="createInvoice"
        />
      </main>
    </div>

    <AddServiceModal
      v-model="showAddServiceModal"
      :form="newServiceForm"
      :brands="motorBrands"
      :types="motorTypes"
      :capacities="engineCapacities"
      :mechanics="mechanics"
      :motor-type-loading="motorTypeLoading"
      @submit="saveNewService"
    />

    <InvoiceModal
      v-model="showInvoiceModal"
      :selected-service="selectedService"
      :invoice-form="invoiceForm"
      :spareparts="spareparts"
      :selected-sparepart="selectedSparepart"
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
import AddStockModal from './components/AddStockModal.vue';
import InvoiceModal from './components/InvoiceModal.vue';

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
  showAddServiceModal,
  showAddStockModal,
  showInvoiceModal,
  selectedService,
  selectedSparepart,
  calculatedTotalInvoice,
  invoiceForm,
  stockForm,
  newServiceForm,
  processPayment,
  saveNewService,
  saveStockIn,
  createInvoice,
  motorTypeLoading,
  errorMessage,
  retryAllData,
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