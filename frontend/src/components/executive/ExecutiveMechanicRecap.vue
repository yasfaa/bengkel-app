<template>
  <div class="card" style="padding: 0; overflow: hidden; height: 100%">
    <div class="recap-header">
      <div style="display: flex; align-items: center; gap: 8px">
        <i class="ph-bold ph-user-gear" style="color: #059669; font-size: 20px"></i>
        <div>
          <h4 style="font-size: 14.5px; font-weight: 800; color: var(--text-main)">
            Rekap Produktivitas Teknisi Mekanik
          </h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 1px">
            Evaluasi beban kerja, unit yang ditangani, dan ketersediaan teknisi
          </p>
        </div>
      </div>
    </div>

    <div style="padding: 16px 20px">
      <div
        class="table-container"
        style="border: 1px solid var(--border-subtle); border-radius: 8px"
      >
        <table class="custom-table" style="font-size: 12.5px">
          <thead>
            <tr>
              <th>Teknisi Mekanik</th>
              <th>Spesialisasi</th>
              <th style="text-align: center">Unit Ditangani</th>
              <th style="text-align: center">Status di Pit</th>
              <th style="text-align: right">Pekerjaan Aktif</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mech in mechanicStats" :key="mech.id">
              <td>
                <div style="display: flex; align-items: center; gap: 8px">
                  <div
                    style="
                      width: 30px;
                      height: 30px;
                      border-radius: 6px;
                      background: #eff6ff;
                      color: var(--primary-color);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 15px;
                      font-weight: 700;
                    "
                  >
                    {{ mech.nama.charAt(0) }}
                  </div>
                  <div>
                    <div style="font-weight: 700; color: var(--text-main)">{{ mech.nama }}</div>
                    <div style="font-size: 11px; color: var(--text-muted)">
                      {{ mech.masaKerja || '-' }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span
                  class="badge"
                  style="background: #f8fafc; color: var(--text-secondary); font-size: 11px"
                >
                  {{ mech.spesialisasi || 'Umum & Tune Up' }}
                </span>
              </td>
              <td style="text-align: center">
                <span style="font-weight: 800; color: var(--primary-color)">{{
                  mech.completedCount
                }}</span>
                Selesai
                <span v-if="mech.activeCount > 0" style="color: #d97706; font-size: 11px">
                  (+{{ mech.activeCount }} proses)
                </span>
              </td>
              <td style="text-align: center">
                <span
                  :class="['badge', mech.status === 'Bekerja' ? 'badge-working' : 'badge-done']"
                  style="font-size: 11px; padding: 3px 8px"
                >
                  {{ mech.status }}
                </span>
              </td>
              <td style="text-align: right">
                <span
                  v-if="mech.activeJob"
                  class="nopol-font"
                  style="font-size: 12.5px; font-weight: 700; color: var(--primary-color)"
                >
                  {{ mech.activeJob }}
                </span>
                <span v-else style="color: #059669; font-weight: 600; font-size: 11.5px">
                  Standby
                </span>
              </td>
            </tr>
            <tr v-if="mechanicStats.length === 0">
              <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 16px">
                Belum ada data mekanik terdaftar.
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

const props = defineProps({
  mechanics: { type: Array, required: true },
  services: { type: Array, required: true },
  getMechanicStatus: { type: Function, required: true },
  getMechanicActiveJob: { type: Function, required: true },
});

const mechanicStats = computed(() => {
  return props.mechanics.map((mech) => {
    const mechServices = props.services.filter(
      (s) => s.mechanicName?.toLowerCase() === mech.nama.toLowerCase()
    );
    const completedCount = mechServices.filter((s) => s.status === 'Selesai' || s.isPaid).length;
    const activeCount = mechServices.filter(
      (s) => s.status === 'Dikerjakan' || s.status === 'Menunggu'
    ).length;

    return {
      ...mech,
      completedCount,
      activeCount,
      status: props.getMechanicStatus(mech.nama),
      activeJob: props.getMechanicActiveJob(mech.nama),
    };
  });
});
</script>

<style scoped>
.recap-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}
</style>
