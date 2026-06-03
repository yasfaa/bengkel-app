<template>
  <div v-if="modelValue" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Form Catat Servis Baru</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nama Pelanggan <span style="color: var(--status-error-text);">*</span></label>
          <input v-model="form.customerName" type="text" class="form-input" placeholder="Masukkan nama pelanggan..." />
        </div>
        <div class="form-group">
          <label class="form-label">Nomor Telepon <span style="color: var(--status-error-text);">*</span></label>
          <input v-model="form.phone" type="text" class="form-input" placeholder="08xxxxxxxxxx" />
        </div>
        <div class="form-group">
          <label class="form-label">Nomor Polisi (Nopol) <span style="color: var(--status-error-text);">*</span></label>
          <input v-model="form.nopol" type="text" class="form-input" placeholder="B 1234 ABC" />
        </div>

        <div class="card" style="padding: 16px; background: #fdfefe; margin-bottom: 20px; border: 1px solid var(--border-color);">
          <div class="form-group">
            <label class="form-label">Merk Motor <span style="color: var(--status-error-text);">*</span></label>
            <select v-model="form.brandId" class="form-input" style="height: auto;">
              <option value="">-- Pilih Merk --</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.nama }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tipe Motor <span style="color: var(--status-error-text);">*</span></label>
            <select v-model="form.typeId" class="form-input" style="height: auto;" :disabled="!form.brandId || motorTypeLoading">
              <option value="">{{ form.brandId ? '-- Pilih Tipe --' : '-- Pilih Merk Terlebih Dahulu --' }}</option>
              <option v-for="type in types" :key="type.id" :value="type.id">{{ type.nama }}</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Kapasitas Mesin <span style="color: var(--status-error-text);">*</span></label>
            <select v-model="form.capacityId" class="form-input" style="height: auto;">
              <option value="">-- Pilih Kapasitas --</option>
              <option v-for="capacity in capacities" :key="capacity.id" :value="capacity.id">{{ capacity.kapasitas }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Keluhan / Deskripsi Servis <span style="color: var(--status-error-text);">*</span></label>
          <input v-model="form.keluhan" type="text" class="form-input" placeholder="Ganti oli, servis rutin, rem blong..." />
        </div>
        <div class="form-group">
          <label class="form-label">Pilih Mekanik (Opsional)</label>
          <select v-model="form.mechanicName" class="form-input" style="height: auto;">
            <option value="">-- Pilih Mekanik --</option>
            <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.nama">{{ mechanic.nama }} ({{ mechanic.waktu_kerja }})</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-accent" @click="$emit('submit')">Simpan Servis</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  form: { type: Object, required: true },
  brands: { type: Array, required: true },
  types: { type: Array, required: true },
  capacities: { type: Array, required: true },
  mechanics: { type: Array, required: true },
  motorTypeLoading: { type: Boolean, default: false },
});

defineEmits(['update:modelValue', 'submit']);
</script>