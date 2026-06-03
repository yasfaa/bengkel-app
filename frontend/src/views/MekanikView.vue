<template>
  <div>
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-weight: 700; margin-bottom: 8px;">Daftar Mekanik</h3>
      <p style="color: var(--text-muted);">Manajemen data kerja mekanik dan status penugasan</p>
    </div>

    <div class="card-grid">
      <div v-for="mechanic in mechanics" :key="mechanic.id" class="card" style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-weight: 700; color: var(--text-main);">{{ mechanic.nama }}</h3>
          <span :class="['badge', getMechanicStatus(mechanic.nama) === 'Standby' ? 'badge-done' : 'badge-working']">
            {{ getMechanicStatus(mechanic.nama) }}
          </span>
        </div>
        <div style="font-size: 13px; color: var(--text-muted);">
          <div><i class="ph ph-calendar"></i> Waktu Kerja: {{ mechanic.waktu_kerja }}</div>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 13px;">
          <div v-if="getMechanicStatus(mechanic.nama) === 'Bekerja'" style="color: var(--status-working-text);">
            🔧 Sedang mengerjakan motor <strong>{{ getMechanicActiveJob(mechanic.nama) }}</strong>
          </div>
          <div v-else style="color: var(--text-muted);">
            ☕ Siap menerima tugas servis baru.
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