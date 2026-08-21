<template>
  <div class="executive-kpi-grid">
    <!-- Card 1: Total Omzet Hari Ini -->
    <div class="card exec-card" style="border-left: 4px solid #7c3aed">
      <div class="exec-card-header">
        <span class="exec-card-label">Total Omzet Hari Ini</span>
        <div class="exec-icon-box" style="background: #f5f3ff; color: #7c3aed">
          <i class="ph-bold ph-coins"></i>
        </div>
      </div>
      <div class="exec-card-value numeric" style="color: #6d28d9">
        Rp {{ formatCurrency(totalRevenue) }}
      </div>
      <div class="exec-card-footer">
        <span style="color: var(--text-muted)">Dari <strong>{{ transactions.length }}</strong> transaksi kasir lunas</span>
      </div>
    </div>

    <!-- Card 2: Total Unit Masuk -->
    <div class="card exec-card" style="border-left: 4px solid #0284c7">
      <div class="exec-card-header">
        <span class="exec-card-label">Total Unit Hari Ini</span>
        <div class="exec-icon-box" style="background: #f0f9ff; color: #0284c7">
          <i class="ph-bold ph-motorcycle"></i>
        </div>
      </div>
      <div class="exec-card-value numeric" style="color: #0369a1">
        {{ totalUnitsToday }} Unit
      </div>
      <div class="exec-card-footer">
        <span style="color: #059669; font-weight: 700">{{ completedUnitsCount }} Selesai</span>
        <span style="color: var(--text-muted)"> • </span>
        <span style="color: #d97706; font-weight: 700">{{ workingUnitsCount }} Di Pit</span>
        <span style="color: var(--text-muted)"> • </span>
        <span style="color: var(--text-muted)">{{ pendingUnitsCount }} Antre</span>
      </div>
    </div>

    <!-- Card 3: Utilisasi Teknisi Mekanik -->
    <div class="card exec-card" style="border-left: 4px solid #059669">
      <div class="exec-card-header">
        <span class="exec-card-label">Kapasitas Teknisi di Pit</span>
        <div class="exec-icon-box" style="background: #ecfdf5; color: #059669">
          <i class="ph-bold ph-users-three"></i>
        </div>
      </div>
      <div class="exec-card-value numeric" style="color: #047857">
        {{ standbyMechanicsCount }} / {{ mechanics.length }} <span style="font-size: 14px; font-weight: 600; color: var(--text-muted)">Standby</span>
      </div>
      <div class="exec-card-footer">
        <span style="color: var(--text-muted)">
          <strong>{{ workingMechanicsCount }}</strong> teknisi sedang aktif mengerjakan unit
        </span>
      </div>
    </div>

    <!-- Card 4: Nilai Persediaan Suku Cadang -->
    <div class="card exec-card" style="border-left: 4px solid #ea580c">
      <div class="exec-card-header">
        <span class="exec-card-label">Kesehatan Stok Gudang</span>
        <div class="exec-icon-box" style="background: #fff7ed; color: #ea580c">
          <i class="ph-bold ph-package"></i>
        </div>
      </div>
      <div class="exec-card-value numeric" style="color: #c2410c">
        {{ lowStockCount }} <span style="font-size: 14px; font-weight: 600; color: var(--text-muted)">Item Kritis</span>
      </div>
      <div class="exec-card-footer">
        <span v-if="lowStockCount > 0" style="color: #dc2626; font-weight: 700">
          ⚠️ Perlu restock segera ke distributor
        </span>
        <span v-else style="color: #059669; font-weight: 700">
          ✅ Semua stok dalam batas aman
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '../../utils/formatters';

const props = defineProps({
  services: { type: Array, required: true },
  mechanics: { type: Array, required: true },
  transactions: { type: Array, required: true },
  spareparts: { type: Array, required: true },
  totalRevenue: { type: Number, required: true },
  standbyMechanicsCount: { type: Number, required: true },
  lowStockCount: { type: Number, required: true },
  getMechanicStatus: { type: Function, required: true },
});

const totalUnitsToday = computed(() => props.services.length);

const completedUnitsCount = computed(() => {
  return props.services.filter((s) => s.status === 'Selesai' || s.isPaid).length;
});

const workingUnitsCount = computed(() => {
  return props.services.filter((s) => s.status === 'Dikerjakan').length;
});

const pendingUnitsCount = computed(() => {
  return props.services.filter((s) => s.status === 'Menunggu').length;
});

const workingMechanicsCount = computed(() => {
  return props.mechanics.filter((m) => props.getMechanicStatus(m.nama) === 'Bekerja').length;
});
</script>

<style scoped>
.executive-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.exec-card {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.exec-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exec-card-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-muted);
}

.exec-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.exec-card-value {
  font-size: 22px;
  font-weight: 900;
  margin: 10px 0 6px 0;
}

.exec-card-footer {
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-subtle);
}
</style>
