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
            required
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
            required
          />
        </div>

        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <div class="form-group">
            <label class="form-label">Tanggal Bergabung (Masuk)</label>
            <input
              v-model="form.tgl_masuk"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal Lahir</label>
            <input
              v-model="form.tgl_lahir"
              type="date"
              class="form-input"
            />
          </div>
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
