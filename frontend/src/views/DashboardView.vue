<template>
  <div>
    <!-- KPI Metric Cards Grid -->
    <div class="card-grid">
      <div class="card card-metric" style="border-left-color: #2563eb;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="card-title">Servis Aktif</div>
            <div class="card-value">{{ activeServices.length }} <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">Motor</span></div>
          </div>
          <div style="background: #eff6ff; color: #2563eb; padding: 10px; border-radius: 8px; font-size: 20px;">
            <i class="ph-bold ph-wrench"></i>
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
          <i class="ph-bold ph-clock"></i>
          <span>Sedang dalam antrean / pengerjaan</span>
        </div>
      </div>

      <div class="card card-metric" style="border-left-color: #059669;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="card-title">Pendapatan Hari Ini</div>
            <div class="card-value numeric">Rp {{ formatCurrency(totalRevenue) }}</div>
          </div>
          <div style="background: #ecfdf5; color: #059669; padding: 10px; border-radius: 8px; font-size: 20px;">
            <i class="ph-bold ph-receipt"></i>
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: #059669; font-weight: 600; display: flex; align-items: center; gap: 4px;">
          <i class="ph-bold ph-trend-up"></i>
          <span>Total transaksi kasir terbayar</span>
        </div>
      </div>

      <div class="card card-metric" style="border-left-color: #0284c7;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="card-title">Mekanik Standby</div>
            <div class="card-value">{{ standbyMechanicsCount }} / {{ mechanics.length }}</div>
          </div>
          <div style="background: #f0f9ff; color: #0284c7; padding: 10px; border-radius: 8px; font-size: 20px;">
            <i class="ph-bold ph-user-gear"></i>
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
          <i class="ph-bold ph-check-circle"></i>
          <span>Teknisi siap menerima order</span>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Split Layout -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
      <!-- Active Services Table Card -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-subtle);">
          <div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">Servis Sedang Berjalan</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Kendaraan dalam antrean pengerjaan teknisi</p>
          </div>
          <button class="btn btn-primary" @click="$emit('open-service-modal')">
            <i class="ph-bold ph-plus"></i> Catat Servis
          </button>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Pelanggan & Kendaraan</th>
                <th>Keluhan</th>
                <th>Mekanik</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in activeServices" :key="service.id">
                <td>
                  <div style="font-weight: 700; color: var(--text-main);">{{ service.customerName }}</div>
                  <div style="font-size: 12px; color: var(--text-secondary); display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                    <span class="nopol-font" style="font-weight: 700; color: var(--primary-color);">{{ service.nopol }}</span>
                    <span>•</span>
                    <span>{{ service.motorType }}</span>
                  </div>
                </td>
                <td style="color: var(--text-secondary);">{{ service.keluhan }}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px; font-weight: 600;">
                    <i class="ph-bold ph-user-gear" style="color: var(--primary-color);"></i>
                    <span>{{ service.mechanicName || 'Belum ditugaskan' }}</span>
                  </div>
                </td>
                <td>
                  <span :class="['badge', getStatusBadgeClass(service.status)]">
                    {{ service.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="activeServices.length === 0">
                <td colspan="4">
                  <div class="empty-state">
                    <div class="empty-state-illust">🛵</div>
                    <div class="empty-state-title">Tidak ada servis aktif</div>
                    <div class="empty-state-desc">Semua order servis telah diselesaikan. Klik tombol di bawah untuk mendaftarkan servis baru.</div>
                    <button class="btn btn-primary" @click="$emit('open-service-modal')">
                      <i class="ph-bold ph-plus"></i> Catat Servis Baru
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions & Alerts Card -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 4px; color: var(--text-main);">Aksi Cepat</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">Jalan pintas operasional harian</p>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-secondary" style="width: 100%; justify-content: flex-start; padding: 12px 16px;" @click="$emit('open-service-modal')">
              <i class="ph-bold ph-motorcycle" style="color: var(--primary-color); font-size: 18px;"></i>
              <span>Catat Servis Masuk</span>
            </button>
            <button class="btn btn-secondary" style="width: 100%; justify-content: flex-start; padding: 12px 16px;" @click="$emit('open-stock-modal')">
              <i class="ph-bold ph-package" style="color: #059669; font-size: 18px;"></i>
              <span>Catat Stok Sparepart Masuk</span>
            </button>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">Stok Sparepart Menipis:</span>
            <span class="badge" :class="lowStockCount > 0 ? 'badge-error' : 'badge-done'">
              {{ lowStockCount }} item
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">Status Operasional:</span>
            <span class="badge badge-done">Normal & Aktif</span>
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