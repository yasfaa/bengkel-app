<template>
  <div class="card" style="padding: 0; overflow: hidden; height: 100%">
    <div class="recap-header">
      <div style="display: flex; align-items: center; gap: 8px">
        <i class="ph-bold ph-kanban" style="color: #0284c7; font-size: 20px"></i>
        <div>
          <h4 style="font-size: 14.5px; font-weight: 800; color: var(--text-main)">
            Rekap Alur Status Antrean Servis Hari Ini
          </h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 1px">
            Distribusi tahapan pengerjaan motor dari penerimaan hingga lunas
          </p>
        </div>
      </div>
    </div>

    <div style="padding: 16px 20px">
      <!-- Status Funnel Cards Grid -->
      <div
        style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px"
      >
        <!-- 1. Menunggu -->
        <div class="status-funnel-card" style="background: #f8fafc; border-color: #cbd5e1">
          <div style="font-size: 11px; font-weight: 700; color: #475569">1. ANTREE / MENUNGGU</div>
          <div
            class="numeric"
            style="font-size: 20px; font-weight: 900; color: #334155; margin-top: 4px"
          >
            {{ queueSummary.menunggu }}
          </div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px">
            Belum mulai dikerjakan
          </div>
        </div>

        <!-- 2. Dikerjakan -->
        <div class="status-funnel-card" style="background: #eff6ff; border-color: #bfdbfe">
          <div style="font-size: 11px; font-weight: 700; color: #1e40af">2. DIKERJAKAN DI PIT</div>
          <div
            class="numeric"
            style="font-size: 20px; font-weight: 900; color: #1d4ed8; margin-top: 4px"
          >
            {{ queueSummary.dikerjakan }}
          </div>
          <div style="font-size: 10.5px; color: #2563eb; margin-top: 2px">
            Sedang ditangani teknisi
          </div>
        </div>

        <!-- 3. Selesai (Belum Bayar) -->
        <div class="status-funnel-card" style="background: #fefce8; border-color: #fef08a">
          <div style="font-size: 11px; font-weight: 700; color: #854d0e">
            3. SELESAI / SIAP KASIR
          </div>
          <div
            class="numeric"
            style="font-size: 20px; font-weight: 900; color: #a16207; margin-top: 4px"
          >
            {{ queueSummary.selesai }}
          </div>
          <div style="font-size: 10.5px; color: #ca8a04; margin-top: 2px">
            Menunggu billing kasir
          </div>
        </div>

        <!-- 4. Lunas -->
        <div class="status-funnel-card" style="background: #f0fdf4; border-color: #bbf7d0">
          <div style="font-size: 11px; font-weight: 700; color: #166534">4. LUNAS & SELESAI</div>
          <div
            class="numeric"
            style="font-size: 20px; font-weight: 900; color: #15803d; margin-top: 4px"
          >
            {{ queueSummary.lunas }}
          </div>
          <div style="font-size: 10.5px; color: #16a34a; margin-top: 2px">
            Transaksi pembayaran tuntas
          </div>
        </div>
      </div>

      <!-- Recent Services Table (View Only) -->
      <div style="font-size: 12.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px">
        Aktivitas 5 Unit Servis Terakhir:
      </div>
      <div
        class="table-container"
        style="border: 1px solid var(--border-subtle); border-radius: 8px"
      >
        <table class="custom-table" style="font-size: 12px">
          <thead>
            <tr>
              <th>No. PKB & Nopol</th>
              <th>Pelanggan</th>
              <th>Tipe Motor</th>
              <th>Keluhan</th>
              <th>Teknisi</th>
              <th style="text-align: center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="svc in recentServices" :key="svc.id">
              <td>
                <span class="pkb-font" style="font-weight: 800; color: var(--primary-color)">{{
                  svc.nomorPkb || 'PKB-' + svc.id
                }}</span>
                <div class="nopol-font" style="font-weight: 700; color: var(--text-main)">
                  {{ svc.nopol }}
                </div>
              </td>
              <td style="font-weight: 600">{{ svc.customerName }}</td>
              <td style="color: var(--text-secondary)">{{ svc.motorType }}</td>
              <td
                style="
                  color: var(--text-muted);
                  max-width: 160px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ svc.keluhan }}
              </td>
              <td>{{ svc.mechanicName || 'Belum ditugaskan' }}</td>
              <td style="text-align: center">
                <span :class="['badge', getStatusBadgeClass(svc.status)]">
                  {{ svc.status }}
                </span>
              </td>
            </tr>
            <tr v-if="recentServices.length === 0">
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 14px">
                Belum ada servis tercatat hari ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getStatusBadgeClass } from '../../utils/formatters';

const props = defineProps({
  services: { type: Array, required: true },
});

const queueSummary = computed(() => {
  const summary = { menunggu: 0, dikerjakan: 0, selesai: 0, lunas: 0 };
  props.services.forEach((s) => {
    if (s.isPaid) {
      summary.lunas += 1;
    } else if (s.status === 'Selesai') {
      summary.selesai += 1;
    } else if (s.status === 'Dikerjakan') {
      summary.dikerjakan += 1;
    } else {
      summary.menunggu += 1;
    }
  });
  return summary;
});

const recentServices = computed(() => {
  return [...props.services].slice(0, 5);
});
</script>

<style scoped>
.recap-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.status-funnel-card {
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 8px;
  text-align: center;
}
</style>
