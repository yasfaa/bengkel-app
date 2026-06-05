<template>
  <div v-if="modelValue" class="modal-backdrop">
    <div class="modal-card" style="max-width: 560px;">
      <div class="modal-header">
        <h3>{{ form.id ? 'Ubah Jasa Servis' : 'Tambah Jasa Servis' }}</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nama Jasa <span style="color: var(--status-error-text);">*</span></label>
          <input v-model="form.nama" type="text" class="form-input" placeholder="Contoh: Servis Ringan" />
        </div>

        <div class="form-group">
          <label class="form-label">Harga <span style="color: var(--status-error-text);">*</span></label>
          <input v-model.number="form.harga" type="number" class="form-input" placeholder="50000" />
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea
            v-model="form.deskripsi"
            class="form-input"
            rows="4"
            style="height: auto; resize: vertical;"
            placeholder="Deskripsi singkat jasa servis..."
          ></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Status</label>
          <select v-model="form.is_active" class="form-input" style="height: auto;">
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-accent" @click="$emit('submit')">Simpan</button>
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