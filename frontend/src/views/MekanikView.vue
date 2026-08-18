<template>
  <div>
    <!-- Section Header -->
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">Daftar Teknisi & Mekanik</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Manajemen teknisi, jadwal jam kerja, dan status penugasan servis real-time</p>
    </div>

    <!-- Mechanic Cards Grid -->
    <div class="card-grid">
      <div v-for="mechanic in mechanics" :key="mechanic.id" class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background: #eff6ff; color: var(--primary-color); padding: 8px; border-radius: 8px; font-size: 18px;">
                <i class="ph-bold ph-user-gear"></i>
              </div>
              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main);">{{ mechanic.nama }}</h4>
            </div>
            <span :class="['badge', getMechanicStatus(mechanic.nama) === 'Standby' ? 'badge-done' : 'badge-working']">
              <i :class="['ph-bold', getMechanicStatus(mechanic.nama) === 'Standby' ? 'ph-check-circle' : 'ph-wrench']"></i>
              {{ getMechanicStatus(mechanic.nama) }}
            </span>
          </div>

          <div style="font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="ph-bold ph-clock" style="color: var(--text-muted);"></i>
              <span>Jadwal: <strong>{{ mechanic.waktu_kerja }}</strong></span>
            </div>
          </div>
        </div>

        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-subtle); font-size: 13px;">
          <div v-if="getMechanicStatus(mechanic.nama) === 'Bekerja'" style="color: var(--status-working-text); font-weight: 600; display: flex; align-items: center; gap: 6px;">
            <i class="ph-bold ph-motorcycle"></i>
            <span>Mengerjakan: <strong>{{ getMechanicActiveJob(mechanic.nama) }}</strong></span>
          </div>
          <div v-else style="color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <i class="ph-bold ph-coffee"></i>
            <span>Siap menerima penugasan servis baru</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  mechanics: { type: Array, required: true },
  getMechanicStatus: { type: Function, required: true },
  getMechanicActiveJob: { type: Function, required: true },
});
</script>