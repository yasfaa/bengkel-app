<template>
  <div>
    <div class="card-grid">
      <div class="card card-metric">
        <div class="card-title">Servis Aktif</div>
        <div class="card-value">{{ activeServices.length }} Motor</div>
      </div>
      <div class="card card-metric" style="border-left-color: var(--primary-color);">
        <div class="card-title">Pendapatan Hari Ini</div>
        <div class="card-value">Rp {{ formatCurrency(totalRevenue) }}</div>
      </div>
      <div class="card card-metric" style="border-left-color: var(--success-color);">
        <div class="card-title">Mekanik Standby</div>
        <div class="card-value">{{ standbyMechanicsCount }} / {{ mechanics.length }}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px;">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-weight: 700;">Servis Sedang Berjalan</h3>
          <button class="btn btn-accent" @click="$emit('open-service-modal')">
            <i class="ph-bold ph-plus"></i> Servis Baru
          </button>
        </div>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Pelanggan / Motor</th>
                <th>Keluhan</th>
                <th>Mekanik</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in activeServices" :key="service.id">
                <td>
                  <div style="font-weight: 700; color: var(--text-main);">{{ service.customerName }}</div>
                  <div style="font-size: 12px; color: var(--text-muted);">{{ service.nopol }} - {{ service.motorType }}</div>
                </td>
                <td>{{ service.keluhan }}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <i class="ph-bold ph-user-gear" style="color: var(--secondary-color);"></i>
                    <span>{{ service.mechanicName || 'Belum ditugaskan' }}</span>
                  </div>
                </td>
                <td>
                  <span :class="['badge', getStatusBadgeClass(service.status)]">{{ service.status }}</span>
                </td>
              </tr>
              <tr v-if="activeServices.length === 0">
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">
                  Tidak ada servis berjalan saat ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-weight: 700; margin-bottom: 16px;">Tindakan Cepat</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-secondary" style="width: 100%; text-align: left;" @click="$emit('open-service-modal')">
              <i class="ph-bold ph-motorcycle"></i> Catat Servis Masuk
            </button>
            <button class="btn btn-secondary" style="width: 100%; text-align: left;" @click="$emit('open-stock-modal')">
              <i class="ph-bold ph-package"></i> Catat Stok Sparepart Masuk
            </button>
          </div>
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--text-muted);">Stok Menipis:</span>
            <span style="font-weight: 700; color: var(--status-error-text);">{{ lowStockCount }} item</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Reservasi Hari Ini:</span>
            <span style="font-weight: 700;">2 Kendaraan</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeServices: { type: Array, required: true },
  mechanics: { type: Array, required: true },
  totalRevenue: { type: Number, required: true },
  standbyMechanicsCount: { type: Number, required: true },
  lowStockCount: { type: Number, required: true },
  formatCurrency: { type: Function, required: true },
  getStatusBadgeClass: { type: Function, required: true },
});

defineEmits(['open-service-modal', 'open-stock-modal']);
</script>