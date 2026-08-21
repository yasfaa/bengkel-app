<template>
  <div class="executive-dashboard-container">
    <!-- Header Banner -->
    <div
      class="card"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: #ffffff;
        border: none;
      "
    >
      <div>
        <div style="display: flex; align-items: center; gap: 8px">
          <span
            class="badge"
            style="
              background: rgba(37, 99, 235, 0.3);
              color: #93c5fd;
              border: 1px solid rgba(147, 197, 253, 0.3);
            "
          >
            Executive Portal
          </span>
          <span style="font-size: 12px; color: #94a3b8">Update Real-Time</span>
        </div>
        <h3 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 6px">
          Executive Dashboard & Rekapitulasi Operasional
        </h3>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 2px">
          Ringkasan performa finansial, utilisasi teknisi, kesehatan stok, dan alur pengerjaan
          bengkel
        </p>
      </div>

      <div style="text-align: right">
        <div style="font-size: 11.5px; color: #94a3b8">Tanggal Rekap:</div>
        <div style="font-size: 14px; font-weight: 700; color: #f8fafc">
          {{ todayFormatted }}
        </div>
      </div>
    </div>

    <!-- 1. Executive Top KPI Cards -->
    <ExecutiveKpiCards
      :services="services"
      :mechanics="mechanics"
      :transactions="transactions"
      :spareparts="spareparts"
      :total-revenue="totalRevenue"
      :standby-mechanics-count="standbyMechanicsCount"
      :low-stock-count="lowStockCount"
      :get-mechanic-status="getMechanicStatus"
    />

    <!-- 2. Dual Column: Revenue Breakdown & Queue Status Funnel -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px">
      <ExecutiveRevenueRecap :transactions="transactions" :total-revenue="totalRevenue" />
      <ExecutiveQueueRecap :services="services" />
    </div>

    <!-- 3. Dual Column: Mechanic Productivity & Inventory Health -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px">
      <ExecutiveMechanicRecap
        :mechanics="mechanics"
        :services="services"
        :get-mechanic-status="getMechanicStatus"
        :get-mechanic-active-job="getMechanicActiveJob"
      />
      <ExecutiveInventoryRecap :spareparts="spareparts" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ExecutiveKpiCards from '../components/executive/ExecutiveKpiCards.vue';
import ExecutiveRevenueRecap from '../components/executive/ExecutiveRevenueRecap.vue';
import ExecutiveQueueRecap from '../components/executive/ExecutiveQueueRecap.vue';
import ExecutiveMechanicRecap from '../components/executive/ExecutiveMechanicRecap.vue';
import ExecutiveInventoryRecap from '../components/executive/ExecutiveInventoryRecap.vue';

defineProps({
  services: { type: Array, required: true },
  mechanics: { type: Array, required: true },
  transactions: { type: Array, required: true },
  spareparts: { type: Array, required: true },
  totalRevenue: { type: Number, required: true },
  standbyMechanicsCount: { type: Number, required: true },
  lowStockCount: { type: Number, required: true },
  getMechanicStatus: { type: Function, required: true },
  getMechanicActiveJob: { type: Function, required: true },
});

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});
</script>

<style scoped>
.executive-dashboard-container {
  display: flex;
  flex-direction: column;
}
</style>
