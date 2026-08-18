<template>
  <div>
    <!-- Section Header Card -->
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">Manajemen Antrean Servis</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Kelola pendaftaran masuk, penugasan teknisi, dan alur pengerjaan servis</p>
      </div>
      <button class="btn btn-primary" @click="$emit('open-service-modal')">
        <i class="ph-bold ph-plus"></i> Catat Servis Baru
      </button>
    </div>

    <!-- Quick Search Bar -->
    <div class="card" style="margin-bottom: 20px; padding: 12px 20px;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <i class="ph-bold ph-magnifying-glass" style="font-size: 18px; color: var(--text-muted);"></i>
        <input
          type="text"
          class="form-input"
          :value="searchQuery"
          placeholder="Cari berdasarkan No Polisi, nama pelanggan, atau tipe motor..."
          style="border: none; box-shadow: none; padding: 0; height: 32px; font-size: 14px;"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
        <span v-if="searchQuery" style="font-size: 12px; color: var(--text-muted); cursor: pointer; font-weight: 600;" @click="$emit('update:searchQuery', '')">
          Hapus
        </span>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>No Polisi / Motor</th>
            <th>Pelanggan</th>
            <th>Keluhan / Catatan</th>
            <th>Teknisi / Mekanik</th>
            <th>Status</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <td>
              <div class="nopol-font" style="font-weight: 700; font-size: 14px; color: var(--primary-color);">
                {{ service.nopol }}
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                {{ service.motorType }}
              </div>
            </td>
            <td>
              <div style="font-weight: 700; color: var(--text-main);">{{ service.customerName }}</div>
              <div class="numeric" style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                {{ service.phone }}
              </div>
            </td>
            <td style="color: var(--text-secondary); max-width: 250px;">
              {{ service.keluhan }}
            </td>
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
            <td style="text-align: right;">
              <button
                v-if="service.status === 'Menunggu'"
                class="btn btn-secondary"
                style="padding: 6px 12px; font-size: 12px;"
                @click="$emit('assign-mechanic', service)"
              >
                <i class="ph-bold ph-play"></i> Mulai Kerjakan
              </button>
              <button
                v-else-if="service.status === 'Dikerjakan'"
                class="btn btn-primary"
                style="padding: 6px 12px; font-size: 12px;"
                @click="$emit('complete-service', service)"
              >
                <i class="ph-bold ph-check"></i> Selesai Servis
              </button>
              <button
                v-else-if="service.status === 'Selesai' && !service.isPaid"
                class="btn btn-primary"
                style="padding: 6px 12px; font-size: 12px; background-color: #059669;"
                @click="$emit('create-invoice', service)"
              >
                <i class="ph-bold ph-receipt"></i> Bayar / Invoice
              </button>
              <span v-else class="badge badge-done">
                <i class="ph-bold ph-check-circle"></i> LUNAS
              </span>
            </td>
          </tr>
          <tr v-if="filteredServices.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-illust">🛵</div>
                <div class="empty-state-title">Data servis tidak ditemukan</div>
                <div class="empty-state-desc">Pencarian tidak menemukan hasil yang sesuai atau antrean servis masih kosong.</div>
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
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  filteredServices: { type: Array, required: true },
  getStatusBadgeClass: { type: Function, required: true },
});

defineEmits(['update:searchQuery', 'open-service-modal', 'assign-mechanic', 'complete-service', 'create-invoice']);
</script>