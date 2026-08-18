<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 580px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="ph-bold ph-package" style="color: var(--primary-color); font-size: 20px;"></i>
          <h3>{{ form.id ? 'Ubah Master Suku Cadang' : 'Tambah Master Suku Cadang Baru' }}</h3>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body">
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Kode Part (SKU) <span class="required-star">*</span></label>
            <input
              v-model="form.kode_part"
              type="text"
              class="form-input sku-code"
              placeholder="Contoh: AHM-MPX2-08L"
              style="text-transform: uppercase;"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Nama Suku Cadang <span class="required-star">*</span></label>
            <input
              v-model="form.nama"
              type="text"
              class="form-input"
              placeholder="Contoh: Oli Mesin AHM MPX2..."
            />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Kategori Suku Cadang <span class="required-star">*</span></label>
            <select v-model="form.kategori" class="form-input">
              <option value="FAST_MOVING">Fast Moving (Kampas, Busi, Filter)</option>
              <option value="OLI">Oli Mesin & Transmisi</option>
              <option value="BAN">Ban Luar & Dalam</option>
              <option value="SLOW_MOVING">Slow Moving (Mesin, Kelistrikan)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Distributor / Supplier</label>
            <select v-model="form.supplier_id" class="form-input">
              <option :value="null">-- Pilih Supplier --</option>
              <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
                {{ sup.nama }}
              </option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Harga Beli / Pokok (Rp) <span class="required-star">*</span></label>
            <input
              v-model.number="form.harga_beli"
              type="number"
              min="0"
              step="1000"
              class="form-input numeric"
              placeholder="40000"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Harga Jual Konsumen (Rp) <span class="required-star">*</span></label>
            <input
              v-model.number="form.harga_jual"
              type="number"
              min="0"
              step="1000"
              class="form-input numeric"
              placeholder="52000"
            />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Stok Fisik Awal (Unit) <span class="required-star">*</span></label>
            <input
              v-model.number="form.stok"
              type="number"
              min="0"
              class="form-input numeric"
              placeholder="10"
            />
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Batas Minimum (Reorder Point)</label>
            <input
              v-model.number="form.min_stok"
              type="number"
              min="1"
              class="form-input numeric"
              placeholder="5"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="$emit('submit')">
          <i class="ph-bold ph-check"></i> {{ form.id ? 'Simpan Perubahan' : 'Tambah Suku Cadang' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  form: { type: Object, required: true },
  suppliers: { type: Array, default: () => [] },
});

defineEmits(['update:modelValue', 'submit']);
</script>
