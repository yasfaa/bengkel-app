<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Form Catat Servis Baru</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body">
        <!-- Error Banner -->
        <div v-if="submitError" class="error-banner" style="margin-bottom: 20px;">
          <div class="error-banner-content">
            <i class="ph-bold ph-warning-circle"></i>
            <span>{{ submitError }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nama Pelanggan <span class="required-star">*</span></label>
          <input
            v-model="form.customerName"
            type="text"
            class="form-input"
            :class="{ 'has-error': fieldErrors.customerName }"
            placeholder="Masukkan nama pelanggan..."
            @input="clearFieldError('customerName')"
          />
          <span v-if="fieldErrors.customerName" class="form-error-msg">{{ fieldErrors.customerName }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Nomor Telepon <span class="required-star">*</span></label>
          <input
            v-model="form.phone"
            type="text"
            class="form-input"
            :class="{ 'has-error': fieldErrors.phone }"
            placeholder="08xxxxxxxxxx"
            @input="clearFieldError('phone')"
          />
          <span v-if="fieldErrors.phone" class="form-error-msg">{{ fieldErrors.phone }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Nomor Polisi (Nopol) <span class="required-star">*</span></label>
          <input
            v-model="form.nopol"
            type="text"
            class="form-input"
            :class="{ 'has-error': fieldErrors.nopol }"
            placeholder="B 1234 ABC"
            @input="clearFieldError('nopol'); validateNopol()"
          />
          <span v-if="fieldErrors.nopol" class="form-error-msg">{{ fieldErrors.nopol }}</span>
        </div>

        <div class="motor-card">
          <div class="form-group">
            <label class="form-label">Merk Motor <span class="required-star">*</span></label>
            <input
              v-model="form.brandName"
              type="text"
              class="form-input"
              :class="{ 'has-error': fieldErrors.brandName }"
              list="brand-options"
              placeholder="Ketik merk atau pilih dari daftar..."
              @input="clearFieldError('brandName')"
            />
            <datalist id="brand-options">
              <option v-for="brand in brands" :key="brand.id" :value="brand.nama"></option>
            </datalist>
            <span v-if="fieldErrors.brandName" class="form-error-msg">{{ fieldErrors.brandName }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Tipe Motor <span class="required-star">*</span></label>
            <input
              v-model="form.typeName"
              type="text"
              class="form-input"
              :class="{ 'has-error': fieldErrors.typeName }"
              list="type-options"
              :placeholder="form.brandName.trim() ? 'Ketik tipe atau pilih dari daftar...' : 'Isi merk terlebih dahulu...'"
              :disabled="!form.brandName.trim() || motorTypeLoading"
              @input="clearFieldError('typeName'); clearOnTypeChange()"
            />
            <datalist id="type-options">
              <option v-for="type in types" :key="type.id" :value="type.nama"></option>
            </datalist>
            <span v-if="fieldErrors.typeName" class="form-error-msg">{{ fieldErrors.typeName }}</span>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Kapasitas Mesin <span class="required-star">*</span></label>
            <input
              v-model="form.capacityName"
              type="text"
              class="form-input"
              :class="{ 'has-error': fieldErrors.capacityName }"
              list="capacity-options"
              :placeholder="form.typeName.trim() ? 'Ketik kapasitas atau pilih dari daftar...' : 'Isi tipe motor terlebih dahulu...'"
              :disabled="!form.typeName.trim()"
              @input="clearFieldError('capacityName')"
            />
            <datalist id="capacity-options">
              <option v-for="cap in capacities" :key="cap.id" :value="cap.kapasitas"></option>
            </datalist>
            <span v-if="fieldErrors.capacityName" class="form-error-msg">{{ fieldErrors.capacityName }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Keluhan / Deskripsi Servis <span class="required-star">*</span></label>
          <input
            v-model="form.keluhan"
            type="text"
            class="form-input"
            :class="{ 'has-error': fieldErrors.keluhan }"
            placeholder="Ganti oli, servis rutin, rem blong..."
            @input="clearFieldError('keluhan')"
          />
          <span v-if="fieldErrors.keluhan" class="form-error-msg">{{ fieldErrors.keluhan }}</span>
        </div>

        <div class="form-group dropdown-wrapper">
          <label class="form-label">Pilih Mekanik (Opsional)</label>
          <select v-model="form.mechanicName" class="form-input">
            <option value="">-- Pilih Mekanik --</option>
            <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.nama">{{ mechanic.nama }} ({{ mechanic.waktu_kerja }})</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-accent" @click="handleSubmit">Simpan Servis</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  form: { type: Object, required: true },
  brands: { type: Array, required: true },
  types: { type: Array, required: true },
  capacities: { type: Array, required: true },
  mechanics: { type: Array, required: true },
  motorTypeLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const NOPOL_REGEX = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/;

const fieldErrors = ref({
  customerName: '',
  phone: '',
  nopol: '',
  brandName: '',
  typeName: '',
  capacityName: '',
  keluhan: '',
});

const submitError = ref('');

const clearFieldError = (field) => {
  fieldErrors.value[field] = '';
  submitError.value = '';
};

const validateNopol = () => {
  const value = props.form.nopol.trim().toUpperCase();
  if (!value) {
    fieldErrors.value.nopol = '';
    return;
  }
  if (!NOPOL_REGEX.test(value)) {
    fieldErrors.value.nopol = 'Format tidak valid. Contoh: B 1234 ABC';
  } else {
    fieldErrors.value.nopol = '';
  }
};

const clearOnTypeChange = () => {
  // Reset capacity saat tipe berubah (kecuali prefilling)
  props.form.capacityName = '';
};

const handleSubmit = () => {
  let hasError = false;
  const errors = { ...fieldErrors.value };

  // Validasi setiap field
  if (!props.form.customerName.trim()) {
    errors.customerName = 'Nama pelanggan wajib diisi';
    hasError = true;
  }
  if (!props.form.phone.trim()) {
    errors.phone = 'Nomor telepon wajib diisi';
    hasError = true;
  }
  if (!props.form.nopol.trim()) {
    errors.nopol = 'Nomor polisi wajib diisi';
    hasError = true;
  } else if (!NOPOL_REGEX.test(props.form.nopol.trim().toUpperCase())) {
    errors.nopol = 'Format nomor polisi tidak valid. Contoh: B 1234 ABC';
    hasError = true;
  }
  if (!props.form.brandName.trim()) {
    errors.brandName = 'Merk motor wajib diisi';
    hasError = true;
  }
  if (!props.form.typeName.trim()) {
    errors.typeName = 'Tipe motor wajib diisi';
    hasError = true;
  }
  if (!props.form.capacityName.trim()) {
    errors.capacityName = 'Kapasitas mesin wajib diisi';
    hasError = true;
  }
  if (!props.form.keluhan.trim()) {
    errors.keluhan = 'Keluhan wajib diisi';
    hasError = true;
  }

  fieldErrors.value = errors;

  if (hasError) {
    submitError.value = 'Harap lengkapi semua kolom yang wajib diisi dengan benar.';
    return;
  }

  submitError.value = '';
  emit('submit');
};

// Reset errors when modal opens/closes
watch(() => props.modelValue, (val) => {
  if (val) {
    fieldErrors.value = {
      customerName: '', phone: '', nopol: '',
      brandName: '', typeName: '', capacityName: '', keluhan: '',
    };
    submitError.value = '';
  }
});
</script>

<style scoped>
/* Tanda bintang merah untuk field wajib */
.required-star {
  color: var(--status-error-text);
}

/* Dropdown wrapper untuk posisi relatif panah custom */
.dropdown-wrapper {
  position: relative;
}

.dropdown-wrapper select.form-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 256 256'%3E%3Cpath fill='%235D6D7E' d='M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  cursor: pointer;
}

/* Input dengan datalist — tampilan konsisten dengan dropdown */
input[list].form-input {
  cursor: auto;
}

input[list].form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(61, 79, 95, 0.15);
}

/* Disabled input — terlihat redup */
input.form-input:disabled,
select.form-input:disabled {
  background-color: #F0F2F5;
  color: #A0AAB8;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Style opsi disabled pada select */
select.form-input option:disabled {
  color: #B0B8C4;
}

/* Hover state untuk option (browser support varies) */
select.form-input option:hover,
select.form-input option:checked {
  background-color: #EDF1F5;
}

/* Sub-card untuk grup data motor */
.motor-card {
  padding: 16px;
  background: #fdfefe;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
</style>