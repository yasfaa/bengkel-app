<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Form Pendaftaran Servis Baru</h3>
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
          <label class="form-label">Nomor Telepon / WhatsApp <span class="required-star">*</span></label>
          <input
            v-model="form.phone"
            type="text"
            class="form-input numeric"
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
            class="form-input nopol-font"
            :class="{ 'has-error': fieldErrors.nopol }"
            placeholder="Contoh: B 1234 ABC"
            style="text-transform: uppercase;"
            @input="clearFieldError('nopol'); validateNopol()"
          />
          <span v-if="fieldErrors.nopol" class="form-error-msg">{{ fieldErrors.nopol }}</span>
        </div>

        <!-- Spesifikasi Motor Card -->
        <div class="motor-card">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <i class="ph-bold ph-motorcycle" style="color: var(--primary-color);"></i>
            <span>Spesifikasi Kendaraan</span>
          </div>

          <div class="form-group">
            <label class="form-label">Merk Motor <span class="required-star">*</span></label>
            <input
              v-model="form.brandName"
              type="text"
              class="form-input"
              :class="{ 'has-error': fieldErrors.brandName }"
              list="brand-options"
              placeholder="Pilih merk motor..."
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
              :placeholder="form.brandName.trim() ? 'Pilih tipe motor...' : 'Pilih merk terlebih dahulu...'"
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
              :placeholder="form.typeName.trim() ? 'Pilih kapasitas mesin...' : 'Pilih tipe terlebih dahulu...'"
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
          <label class="form-label">Keluhan / Catatan Servis <span class="required-star">*</span></label>
          <input
            v-model="form.keluhan"
            type="text"
            class="form-input"
            :class="{ 'has-error': fieldErrors.keluhan }"
            placeholder="Contoh: Ganti oli mesin, cek rem depan..."
            @input="clearFieldError('keluhan')"
          />
          <span v-if="fieldErrors.keluhan" class="form-error-msg">{{ fieldErrors.keluhan }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Penugasan Teknisi / Mekanik (Opsional)</label>
          <select v-model="form.mechanicName" class="form-input">
            <option value="">-- Tugaskan Nanti (Status Menunggu) --</option>
            <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.nama">
              {{ mechanic.nama }} ({{ mechanic.waktu_kerja }})
            </option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="handleSubmit">Simpan Order Servis</button>
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
  props.form.capacityName = '';
};

const handleSubmit = () => {
  let hasError = false;
  const errors = { ...fieldErrors.value };

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
    submitError.value = 'Harap lengkapi semua kolom wajib dengan benar.';
    return;
  }

  submitError.value = '';
  emit('submit');
};

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