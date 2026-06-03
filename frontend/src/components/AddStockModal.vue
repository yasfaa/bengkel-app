<template>
  <div v-if="modelValue" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Input Stok Sparepart Masuk</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Pilih Item Sparepart</label>
          <select v-model="stockForm.sparepartId" class="form-input" style="height: auto;">
            <option value="">-- Pilih Sparepart --</option>
            <option v-for="part in spareparts" :key="part.id" :value="part.id">{{ part.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah Masuk (Unit)</label>
          <input v-model.number="stockForm.qty" type="number" class="form-input" placeholder="Masukkan jumlah unit..." />
        </div>
        <div class="form-group">
          <label class="form-label">Nama Supplier</label>
          <input v-model="stockForm.supplier" type="text" class="form-input" placeholder="Nama distributor/supplier..." />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-accent" @click="$emit('submit')">Simpan Stok Masuk</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  stockForm: { type: Object, required: true },
  spareparts: { type: Array, required: true },
});

defineEmits(['update:modelValue', 'submit']);
</script>