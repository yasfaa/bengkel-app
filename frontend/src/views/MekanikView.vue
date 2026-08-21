<template>
  <div>
    <!-- Section Header Card -->
    <div
      class="card"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      "
    >
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main)">
          Master Data & Kapasitas Teknisi Mekanik
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
          {{
            authStore.isKepalaBengkel
              ? 'Kelola data teknisi, akun pengguna, spesialisasi servis, dan status aktivitas pengerjaan unit'
              : 'Informasi daftar teknisi mekanik, masa kerja, spesialisasi, dan status ketersediaan di Pit'
          }}
        </p>
      </div>
      <button
        v-if="authStore.isKepalaBengkel"
        class="btn btn-primary"
        @click="$emit('open-mechanic-modal')"
      >
        <i class="ph-bold ph-plus"></i> Tambah Teknisi Baru
      </button>
    </div>

    <!-- Mechanic Cards Grid -->
    <div
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px"
    >
      <div
        v-for="mechanic in mechanics"
        :key="mechanic.id"
        class="card"
        style="display: flex; flex-direction: column; justify-content: space-between"
      >
        <div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 14px;
            "
          >
            <div style="display: flex; gap: 12px; align-items: center">
              <div
                style="
                  width: 44px;
                  height: 44px;
                  border-radius: 10px;
                  background: #eff6ff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: var(--primary-color);
                "
              >
                <i class="ph-bold ph-user-gear" style="font-size: 24px"></i>
              </div>
              <div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main)">
                  {{ mechanic.nama }}
                </h4>
                <div style="font-size: 12px; color: var(--primary-color); font-weight: 600">
                  {{ mechanic.spesialisasi || 'Umum & Tune Up' }}
                </div>
              </div>
            </div>
            <span
              :class="[
                'badge',
                getMechanicStatus(mechanic.nama) === 'Bekerja' ? 'badge-working' : 'badge-done',
              ]"
            >
              {{ getMechanicStatus(mechanic.nama) }}
            </span>
          </div>

          <div
            style="
              background: #f8fafc;
              border: 1px solid var(--border-subtle);
              border-radius: 8px;
              padding: 12px 14px;
              font-size: 13px;
              margin-bottom: 14px;
            "
          >
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
              <span style="color: var(--text-muted)">Masa Kerja:</span>
              <strong style="color: var(--text-secondary)">{{
                mechanic.masaKerja || mechanic.waktuKerja || '-'
              }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
              <span style="color: var(--text-muted)">Tgl Masuk:</span>
              <span style="color: var(--text-secondary); font-size: 12px">
                {{
                  mechanic.tglMasuk
                    ? new Date(mechanic.tglMasuk).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '-'
                }}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span style="color: var(--text-muted)">Tugas Aktif:</span>
              <strong
                v-if="getMechanicActiveJob(mechanic.nama)"
                class="nopol-font"
                style="color: var(--primary-color)"
              >
                {{ getMechanicActiveJob(mechanic.nama) }}
              </strong>
              <span v-else style="color: #059669; font-weight: 600">Siap Ambil Servis</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons (Only for Kepala Bengkel) -->
        <div
          v-if="authStore.isKepalaBengkel"
          style="
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid var(--border-subtle);
            padding-top: 12px;
            margin-top: 8px;
          "
        >
          <button
            class="btn btn-secondary"
            style="padding: 6px 12px; font-size: 12px"
            @click="$emit('edit-mechanic', mechanic)"
          >
            <i class="ph-bold ph-pencil"></i> Ubah
          </button>
          <button
            class="btn btn-danger"
            style="padding: 6px 12px; font-size: 12px"
            @click="$emit('delete-mechanic', mechanic)"
          >
            <i class="ph-bold ph-trash"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

defineProps({
  mechanics: { type: Array, required: true },
  getMechanicStatus: { type: Function, required: true },
  getMechanicActiveJob: { type: Function, required: true },
});

defineEmits(['open-mechanic-modal', 'edit-mechanic', 'delete-mechanic']);
</script>
