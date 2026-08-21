<template>
  <div>
    <!-- Section Header Card -->
    <div
      class="card"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      "
    >
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main)">
          {{
            authStore.isMechanic
              ? 'Tugas Servis Saya (Pengerjaan Bengkel)'
              : 'Antrean Servis & Perintah Kerja Bengkel (PKB)'
          }}
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
          {{
            authStore.isMechanic
              ? 'Daftar pengerjaan motor yang ditugaskan kepada Anda hari ini'
              : 'Penerimaan unit Service Advisor (SA), alokasi pit pengerjaan, dan pencetakan dokumen PKB'
          }}
        </p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="btn btn-primary"
        @click="$emit('open-service-modal')"
      >
        <i class="ph-bold ph-plus"></i> Catat Servis / Buat PKB
      </button>
    </div>

    <!-- Quick Search Bar -->
    <div class="card" style="margin-bottom: 20px; padding: 12px 20px">
      <div style="display: flex; gap: 12px; align-items: center">
        <i
          class="ph-bold ph-magnifying-glass"
          style="font-size: 18px; color: var(--text-muted)"
        ></i>
        <input
          type="text"
          class="form-input"
          :value="searchQuery"
          placeholder="Cari berdasarkan No. PKB (PKB-XXX), No. Polisi, nama pelanggan, atau tipe motor..."
          style="border: none; box-shadow: none; padding: 0; height: 32px; font-size: 14px"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
        <span
          v-if="searchQuery"
          style="font-size: 12px; color: var(--text-muted); cursor: pointer; font-weight: 600"
          @click="$emit('update:searchQuery', '')"
        >
          Hapus
        </span>
      </div>
    </div>

    <!-- Data Table PKB & Antrean -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>No. PKB & Nopol</th>
            <th>Pelanggan</th>
            <th>Odometer & Paket</th>
            <th>Keluhan Konsumen</th>
            <th>Teknisi / Mekanik</th>
            <th style="text-align: center">Status</th>
            <th style="text-align: right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <!-- No. PKB & Nopol -->
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

            <!-- Pelanggan & Phone -->
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

            <!-- Odometer & Paket -->
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
              <div v-if="service.levelBensin" style="font-size: 11px; color: var(--text-muted)">
                Bensin: <strong>{{ service.levelBensin }}</strong>
              </div>
            </td>

            <!-- Keluhan & Catatan -->
            <td style="color: var(--text-secondary); max-width: 220px">
              <div>{{ service.keluhan }}</div>
              <div
                v-if="service.catatanKondisi && service.catatanKondisi !== '-'"
                style="
                  font-size: 11.5px;
                  color: var(--text-muted);
                  margin-top: 3px;
                  font-style: italic;
                "
              >
                "{{ service.catatanKondisi }}"
              </div>
            </td>

            <!-- Teknisi -->
            <td>
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 600">
                <i class="ph-bold ph-user-gear" style="color: var(--primary-color)"></i>
                <span>{{ service.mechanicName || 'Belum ditugaskan' }}</span>
              </div>
              <div
                v-if="service.mechanicSpecialization"
                style="font-size: 11.5px; color: var(--text-muted); margin-left: 20px"
              >
                {{ service.mechanicSpecialization }}
              </div>
            </td>

            <!-- Status -->
            <td style="text-align: center">
              <span :class="['badge', getStatusBadgeClass(service.status)]">
                {{ service.status }}
              </span>
            </td>

            <!-- Actions (Scoped per Role) -->
            <td style="text-align: right; white-space: nowrap">
              <!-- Tombol Kelola Part & Jasa PKB (Tahap 3) -->
              <button
                v-if="service.status !== 'Selesai' || !service.isPaid"
                class="btn btn-secondary"
                style="
                  padding: 6px 10px;
                  font-size: 12px;
                  margin-right: 6px;
                  color: var(--primary-color);
                  border-color: var(--primary-color);
                "
                :title="
                  authStore.isMechanic
                    ? 'Ajukan Suku Cadang & Jasa Tambahan'
                    : 'Lihat Rincian Suku Cadang & Jasa PKB'
                "
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

              <!-- Tombol Lihat / Cetak PKB -->
              <button
                class="btn btn-secondary"
                style="padding: 6px 10px; font-size: 12px; margin-right: 6px"
                title="Lihat Lembar Dokumen PKB"
                @click="$emit('open-pkb-modal', service)"
              >
                <i class="ph-bold ph-file-text"></i> PKB
              </button>

              <!-- Status Action Buttons -->
              <!-- 1. Menunggu -->
              <template v-if="service.status === 'Menunggu'">
                <button
                  v-if="authStore.isAdmin"
                  :class="['btn', service.mechanicName ? 'btn-primary' : 'btn-secondary']"
                  style="padding: 6px 12px; font-size: 12px"
                  :title="service.mechanicName ? 'Mulai pengerjaan atau alihkan teknisi' : 'Tugaskan teknisi pelaksana'"
                  @click="$emit('assign-mechanic', service)"
                >
                  <i :class="['ph-bold', service.mechanicName ? 'ph-play' : 'ph-user-plus']"></i>
                  {{ service.mechanicName ? 'Mulai / Alokasi' : 'Tugaskan' }}
                </button>
                <button
                  v-else-if="authStore.isMechanic"
                  class="btn btn-primary"
                  style="padding: 6px 12px; font-size: 12px"
                  title="Mulai pengerjaan servis di Pit"
                  @click="$emit('assign-mechanic', service)"
                >
                  <i class="ph-bold ph-play"></i> Mulai Servis
                </button>
              </template>

              <!-- 2. Dikerjakan (Hanya Mekanik yang bisa menyelesaikan servis) -->
              <template v-else-if="service.status === 'Dikerjakan'">
                <button
                  v-if="authStore.isMechanic"
                  class="btn btn-primary"
                  style="padding: 6px 12px; font-size: 12px"
                  title="Selesaikan pengerjaan servis motor ini"
                  @click="$emit('complete-service', service)"
                >
                  <i class="ph-bold ph-check"></i> Selesai
                </button>
                <span
                  v-else
                  class="badge badge-working"
                  style="font-size: 11px; padding: 5px 10px"
                  title="Sedang dikerjakan oleh teknisi mekanik"
                >
                  <i class="ph-bold ph-gear"></i> Dikerjakan
                </span>
              </template>

              <!-- 3. Selesai (Kasir / Billing) -->
              <template v-else-if="service.status === 'Selesai' && !service.isPaid">
                <button
                  v-if="authStore.isAdmin"
                  class="btn btn-primary"
                  style="padding: 6px 12px; font-size: 12px; background-color: #059669"
                  @click="$emit('create-invoice', service)"
                >
                  <i class="ph-bold ph-receipt"></i> Kasir
                </button>
                <span
                  v-else
                  class="badge badge-pending"
                  style="font-size: 11px; padding: 5px 10px"
                >
                  Belum Lunas
                </span>
              </template>

              <!-- 4. Lunas -->
              <span v-else class="badge badge-done">
                <i class="ph-bold ph-check-circle"></i> LUNAS
              </span>
            </td>
          </tr>
          <tr v-if="filteredServices.length === 0">
            <td colspan="7">
              <div class="empty-state">
                <div class="empty-state-illust">🛵</div>
                <div class="empty-state-title">
                  {{
                    authStore.isMechanic
                      ? 'Tidak ada tugas servis aktif untuk Anda'
                      : 'Antrean servis tidak ditemukan'
                  }}
                </div>
                <div class="empty-state-desc">
                  {{
                    authStore.isMechanic
                      ? 'Saat ini belum ada unit motor yang dialokasikan atau ditugaskan kepada Anda.'
                      : 'Pencarian tidak menemukan hasil atau belum ada PKB yang terdaftar hari ini.'
                  }}
                </div>
                <button
                  v-if="authStore.isAdmin"
                  class="btn btn-primary"
                  @click="$emit('open-service-modal')"
                >
                  <i class="ph-bold ph-plus"></i> Catat Servis / Buat PKB
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
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

defineProps({
  searchQuery: { type: String, default: '' },
  filteredServices: { type: Array, required: true },
  getStatusBadgeClass: { type: Function, required: true },
});

defineEmits([
  'update:searchQuery',
  'open-service-modal',
  'open-pkb-modal',
  'open-part-modal',
  'assign-mechanic',
  'complete-service',
  'create-invoice',
]);
</script>
