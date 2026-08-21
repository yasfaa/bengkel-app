<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 540px">
      <div class="modal-header">
        <h3>{{ form.id ? 'Ubah Jasa Servis' : 'Tambah Jasa Servis Baru' }}</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nama Jasa Servis <span class="required-star">*</span></label>
          <input
            v-model="form.nama"
            type="text"
            class="form-input"
            placeholder="Contoh: Servis Ringan, Ganti Kampas Rem..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Tarif / Harga (Rp) <span class="required-star">*</span></label>
          <input
            v-model.number="form.harga"
            type="number"
            min="0"
            step="1000"
            class="form-input numeric"
            placeholder="Contoh: 50000"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi Singkat</label>
          <textarea
            v-model="form.deskripsi"
            class="form-input"
            rows="3"
            style="height: auto; resize: vertical"
            placeholder="Keterangan rincian pengerjaan jasa..."
          ></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 0">
          <label class="form-label">Status Layanan</label>
          <select v-model="form.is_active" class="form-input">
            <option :value="true">Aktif (Dapat Dipilih)</option>
            <option :value="false">Nonaktif (Diarsipkan)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="$emit('submit')">
          <i class="ph-bold ph-check"></i> {{ form.id ? 'Perbarui Jasa' : 'Simpan Jasa' }}
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
