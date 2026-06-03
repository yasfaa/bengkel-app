<template>
  <div>
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-weight: 700;">Manajemen Servis Masuk</h3>
        <p style="color: var(--text-muted);">Kelola antrean servis kendaraan pelanggan</p>
      </div>
      <button class="btn btn-accent" @click="$emit('open-service-modal')">
        <i class="ph-bold ph-plus"></i> Servis Baru
      </button>
    </div>

    <div class="card" style="margin-bottom: 24px; padding: 16px 24px;">
      <div style="display: flex; gap: 16px; align-items: center;">
        <i class="ph-bold ph-magnifying-glass" style="font-size: 20px; color: var(--text-muted);"></i>
        <input
          type="text"
          class="form-input"
          :value="searchQuery"
          placeholder="Cari berdasarkan No Polisi atau Nama Pelanggan..."
          style="flex: 1; border: none; height: 36px; padding: 0;"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </div>
    </div>

    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>No Polisi / Motor</th>
            <th>Pelanggan</th>
            <th>Keluhan</th>
            <th>Mekanik</th>
            <th>Status</th>
            <th style="text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <td>
              <div style="font-weight: 700;">{{ service.nopol }}</div>
              <div style="font-size: 12px; color: var(--text-muted);">{{ service.motorType }}</div>
            </td>
            <td>
              <div style="font-weight: 600;">{{ service.customerName }}</div>
              <div style="font-size: 12px; color: var(--text-muted);">{{ service.phone }}</div>
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
            <td style="text-align: right;">
              <button
                v-if="service.status === 'Menunggu'"
                class="btn btn-secondary"
                style="padding: 6px 12px; font-size: 12px;"
                @click="$emit('assign-mechanic', service)"
              >
                Mulai Kerjakan
              </button>
              <button
                v-else-if="service.status === 'Dikerjakan'"
                class="btn btn-primary"
                style="padding: 6px 12px; font-size: 12px;"
                @click="$emit('complete-service', service)"
              >
                Selesai Servis
              </button>
              <button
                v-else-if="service.status === 'Selesai' && !service.isPaid"
                class="btn btn-accent"
                style="padding: 6px 12px; font-size: 12px;"
                @click="$emit('create-invoice', service)"
              >
                Bayar / Invoice
              </button>
              <span v-else style="color: var(--text-muted); font-weight: 700; font-size: 12px;">LUNAS</span>
            </td>
          </tr>
          <tr v-if="filteredServices.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-illust" style="color: var(--secondary-color);">🛵</div>
                <div class="empty-state-title">Belum ada data servis</div>
                <div class="empty-state-desc">Pencarian tidak menemukan hasil atau antrean servis masih kosong.</div>
                <button class="btn btn-accent" @click="$emit('open-service-modal')">
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