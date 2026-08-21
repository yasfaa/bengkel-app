<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 520px">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="ph-bold ph-user-gear" style="color: var(--primary-color); font-size: 20px"></i>
          <h3>{{ form.id ? 'Ubah Data Mekanik' : 'Tambah Teknisi / Mekanik Baru' }}</h3>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label"
            >Nama Lengkap Mekanik <span class="required-star">*</span></label
          >
          <input
            v-model="form.nama"
            type="text"
            class="form-input"
            placeholder="Contoh: Asep Supriadi"
          />
        </div>

        <div class="form-group">
          <label class="form-label"
            >Spesialisasi Keahlian <span class="required-star">*</span></label
          >
          <input
            v-model="form.spesialisasi"
            type="text"
            class="form-input"
            placeholder="Contoh: Mesin & CVT, Kelistrikan & Injeksi..."
          />
        </div>

        <div class="form-group">
          <label class="form-label"
            >Jadwal / Waktu Kerja <span class="required-star">*</span></label
          >
          <select v-model="form.waktu_kerja" class="form-input">
            <option value="Full-time (08:00 - 17:00)">Full-time (08:00 - 17:00)</option>
            <option value="Part-time (08:00 - 13:00)">Part-time Pagi (08:00 - 13:00)</option>
            <option value="Part-time (13:00 - 18:00)">Part-time Siang (13:00 - 18:00)</option>
            <option value="Shift Malam (17:00 - 22:00)">Shift Malam (17:00 - 22:00)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0">
          <label class="form-label">Status Ketersediaan</label>
          <select v-model="form.is_active" class="form-input">
            <option :value="true">Aktif Bekerja</option>
            <option :value="false">Nonaktif / Cuti</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="$emit('submit')">
          <i class="ph-bold ph-check"></i> {{ form.id ? 'Simpan Perubahan' : 'Tambah Mekanik' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  form: { type: Object, required: true },
});

defineEmits(['update:modelValue', 'submit']);
</script>
