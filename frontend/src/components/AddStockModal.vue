<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Input Stok Sparepart Masuk</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label"
            >Pilih Item Sparepart <span class="required-star">*</span></label
          >
          <select v-model="stockForm.sparepartId" class="form-input">
            <option value="">-- Pilih Sparepart --</option>
            <option v-for="part in spareparts" :key="part.id" :value="part.id">
              {{ part.name }} (Stok saat ini: {{ part.stok }} unit)
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah Masuk (Unit) <span class="required-star">*</span></label>
          <input
            v-model.number="stockForm.qty"
            type="number"
            min="1"
            class="form-input numeric"
            placeholder="Masukkan jumlah unit..."
          />
        </div>
        <div class="form-group" style="margin-bottom: 0">
          <label class="form-label">Nama Supplier / Distributor</label>
          <input
            v-model="stockForm.supplier"
            type="text"
            class="form-input"
            placeholder="Contoh: PT Astra Otoparts, Distributor Resmi..."
          />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="$emit('submit')">
          <i class="ph-bold ph-plus"></i> Simpan Stok Masuk
        </button>
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
