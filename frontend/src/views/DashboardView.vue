<template>
  <div>
    <!-- KPI Metric Cards Grid -->
    <div class="card-grid">
      <div class="card card-metric">
        <div>
          <div class="card-title">Antrean Berjalan</div>
          <div class="card-value numeric">{{ activeServices.length }}</div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px">
          Unit dalam status menunggu / dikerjakan
        </div>
      </div>

      <div class="card card-metric" style="border-left-color: #059669">
        <div>
          <div class="card-title">Mekanik Standby</div>
          <div class="card-value numeric" style="color: #059669">
            {{ standbyMechanicsCount }} / {{ mechanics.length }}
          </div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px">
          Teknisi siap menerima order servis
        </div>
      </div>

      <div class="card card-metric" style="border-left-color: #d97706">
        <div>
          <div class="card-title">Stok Suku Cadang Menipis</div>
          <div class="card-value numeric" style="color: #d97706">{{ lowStockCount }}</div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px">
          Item sparepart di bawah batas minimum
        </div>
      </div>

      <div class="card card-metric" style="border-left-color: #7c3aed">
        <div>
          <div class="card-title">Total Pendapatan Hari Ini</div>
          <div class="card-value numeric" style="color: #7c3aed">
            Rp {{ formatCurrency(totalRevenue) }}
          </div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px">
          Akumulasi transaksi kasir lunas
        </div>
      </div>
    </div>

    <!-- Active Services Table Section -->
    <div class="card" style="margin-bottom: 24px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main)">
            Antrean Servis Aktif & Status Pit
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
            Daftar motor yang sedang ditangani atau mengantre di bengkel
          </p>
        </div>
        <button class="btn btn-primary" @click="$emit('open-service-modal')">
          <i class="ph-bold ph-plus"></i> Catat Servis / Buat PKB
        </button>
      </div>

      <div class="table-container" style="box-shadow: none; border-radius: 8px">
        <table class="custom-table">
          <thead>
            <tr>
              <th>No. PKB & Nopol</th>
              <th>Pelanggan</th>
              <th>Odometer & Paket</th>
              <th>Keluhan</th>
              <th>Teknisi / Mekanik</th>
              <th style="text-align: center">Status</th>
              <th style="text-align: right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in activeServices" :key="service.id">
              <td>
                <div
                  class="pkb-font"
                  style="font-weight: 800; font-size: 13px; color: var(--primary-color)"
                >
                  {{ service.nomorPkb || 'PKB-' + service.id }}
                </div>
                <div
                  class="nopol-font"
                  style="
                    font-weight: 700;
                    font-size: 13.5px;
                    color: var(--text-main);
                    margin-top: 2px;
                  "
                >
                  {{ service.nopol }}
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted)">
                  {{ service.motorType }}
                </div>
              </td>
              <td>
                <div style="font-weight: 700; color: var(--text-main)">
                  {{ service.customerName }}
                </div>
                <div
                  class="numeric"
                  style="font-size: 12px; color: var(--text-secondary); margin-top: 2px"
                >
                  {{ service.phone }}
                </div>
              </td>
              <td>
                <div
                  class="numeric"
                  style="font-weight: 700; font-size: 13px; color: var(--text-main)"
                >
                  {{ service.kmMasuk ? service.kmMasuk + ' KM' : '-' }}
                </div>
                <div
                  style="
                    font-size: 12px;
                    color: var(--primary-color);
                    font-weight: 600;
                    margin-top: 2px;
                  "
                >
                  {{ service.servicePackageName || 'Servis Umum' }}
                </div>
              </td>
              <td style="color: var(--text-secondary); max-width: 220px">
                <div>{{ service.keluhan }}</div>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 6px; font-weight: 600">
                  <i class="ph-bold ph-user-gear" style="color: var(--primary-color)"></i>
                  <span>{{ service.mechanicName || 'Belum ditugaskan' }}</span>
                </div>
              </td>
              <td style="text-align: center">
                <span :class="['badge', getStatusBadgeClass(service.status)]">
                  {{ service.status }}
                </span>
              </td>
              <td style="text-align: right; white-space: nowrap">
                <!-- Tombol Part & Jasa (Tahap 3) -->
                <button
                  class="btn btn-secondary"
                  style="
                    padding: 6px 10px;
                    font-size: 12px;
                    margin-right: 6px;
                    color: var(--primary-color);
                    border-color: var(--primary-color);
                  "
                  title="Kelola Permintaan Suku Cadang & Jasa Tambahan (Tahap 3)"
                  @click="$emit('open-part-modal', service)"
                >
                  <i class="ph-bold ph-wrench"></i> Part & Jasa
                  <span
                    v-if="service.serviceItems && service.serviceItems.length > 0"
                    class="badge badge-primary"
                    style="padding: 1px 5px; font-size: 10px; margin-left: 3px; border-radius: 10px"
                  >
                    {{ service.serviceItems.length }}
                  </span>
                </button>

                <button
                  class="btn btn-secondary"
                  style="padding: 6px 10px; font-size: 12px; margin-right: 6px"
                  title="Lihat Dokumen PKB"
                  @click="$emit('open-pkb-modal', service)"
                >
                  <i class="ph-bold ph-file-text"></i> PKB
                </button>
                <button
                  v-if="service.status === 'Menunggu'"
                  class="btn btn-secondary"
                  style="padding: 6px 12px; font-size: 12px"
                  @click="$emit('assign-mechanic', service)"
                >
                  <i class="ph-bold ph-play"></i> Mulai
                </button>
                <button
                  v-else-if="service.status === 'Dikerjakan'"
                  class="btn btn-primary"
                  style="padding: 6px 12px; font-size: 12px"
                  @click="$emit('complete-service', service)"
                >
                  <i class="ph-bold ph-check"></i> Selesai
                </button>
              </td>
            </tr>
            <tr v-if="activeServices.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-illust">🎉</div>
                  <div class="empty-state-title">Semua antrean servis telah selesai</div>
                  <div class="empty-state-desc">
                    Tidak ada antrean servis yang sedang berjalan saat ini.
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeServices: { type: Array, required: true },
  mechanics: { type: Array, required: true },
  standbyMechanicsCount: { type: Number, required: true },
  lowStockCount: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  getStatusBadgeClass: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
});

defineEmits([
  'open-service-modal',
  'open-pkb-modal',
  'open-part-modal',
  'assign-mechanic',
  'complete-service',
]);
</script>
