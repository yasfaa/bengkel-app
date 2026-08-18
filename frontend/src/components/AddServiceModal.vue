<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 680px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="ph-bold ph-clipboard-text" style="color: var(--primary-color); font-size: 20px;"></i>
          <h3>Reception & Pembuatan PKB (Service Advisor)</h3>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body">
        <!-- Submit Error Banner -->
        <div v-if="submitError" class="error-banner" style="margin-bottom: 18px;">
          <div class="error-banner-content">
            <i class="ph-bold ph-warning-circle"></i>
            <span>{{ submitError }}</span>
          </div>
        </div>

        <!-- 1. IDENTITAS PELANGGAN & KENDARAAN -->
        <div class="section-card">
          <div class="section-card-title">
            <i class="ph-bold ph-user" style="color: var(--primary-color);"></i>
            <span>1. Data Pelanggan & Kendaraan</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Nomor Polisi (Nopol) <span class="required-star">*</span></label>
              <input
                v-model="form.nopol"
                type="text"
                class="form-input nopol-font"
                :class="{ 'has-error': fieldErrors.nopol }"
                placeholder="B 1234 ABC"
                style="text-transform: uppercase; font-weight: 700; color: var(--primary-color);"
                @input="clearFieldError('nopol'); validateNopol()"
              />
              <span v-if="fieldErrors.nopol" class="form-error-msg">{{ fieldErrors.nopol }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Nama Pelanggan <span class="required-star">*</span></label>
              <input
                v-model="form.customerName"
                type="text"
                class="form-input"
                :class="{ 'has-error': fieldErrors.customerName }"
                placeholder="Nama lengkap pelanggan..."
                @input="clearFieldError('customerName')"
              />
              <span v-if="fieldErrors.customerName" class="form-error-msg">{{ fieldErrors.customerName }}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">No. WhatsApp / HP <span class="required-star">*</span></label>
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
              <label class="form-label">Merk Motor <span class="required-star">*</span></label>
              <input
                v-model="form.brandName"
                type="text"
                class="form-input"
                :class="{ 'has-error': fieldErrors.brandName }"
                list="brand-options"
                placeholder="Pilih merk..."
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
                :placeholder="form.brandName.trim() ? 'Pilih tipe...' : 'Pilih merk dahulu...'"
                :disabled="!form.brandName.trim() || motorTypeLoading"
                @input="clearFieldError('typeName')"
              />
              <datalist id="type-options">
                <option v-for="type in types" :key="type.id" :value="type.nama"></option>
              </datalist>
              <span v-if="fieldErrors.typeName" class="form-error-msg">{{ fieldErrors.typeName }}</span>
            </div>
          </div>
        </div>

        <!-- 2. INSPEKSI AWAL & ODOMETER (CHECKLIST RECEPTION) -->
        <div class="section-card">
          <div class="section-card-title">
            <i class="ph-bold ph-gauge" style="color: #0284c7;"></i>
            <span>2. Inspeksi Awal & Odometer Unit</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">KM Odometer Masuk <span class="required-star">*</span></label>
              <div style="position: relative;">
                <input
                  v-model.number="form.kmMasuk"
                  type="number"
                  min="0"
                  class="form-input numeric"
                  :class="{ 'has-error': fieldErrors.kmMasuk }"
                  placeholder="Contoh: 15200"
                  @input="clearFieldError('kmMasuk')"
                />
                <span style="position: absolute; right: 12px; top: 10px; font-size: 12px; font-weight: 700; color: var(--text-muted);">KM</span>
              </div>
              <span v-if="fieldErrors.kmMasuk" class="form-error-msg">{{ fieldErrors.kmMasuk }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Level Indikator Bensin</label>
              <div class="fuel-level-group">
                <button
                  v-for="fuel in ['E', '1/4', '1/2', '3/4', 'Full']"
                  :key="fuel"
                  type="button"
                  :class="['fuel-btn', { active: form.levelBensin === fuel }]"
                  @click="form.levelBensin = fuel"
                >
                  {{ fuel }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Catatan Kondisi Fisik & Kelengkapan</label>
            <input
              v-model="form.catatanKondisi"
              type="text"
              class="form-input"
              placeholder="Contoh: Spion lengkap, helm ditinggal di bagasi, lecet bodi samping kanan..."
            />
          </div>
        </div>

        <!-- 3. DIAGNOSA KELUHAN & PAKET SERVIS -->
        <div class="section-card" style="margin-bottom: 0;">
          <div class="section-card-title">
            <i class="ph-bold ph-wrench" style="color: #059669;"></i>
            <span>3. Diagnosa Keluhan & Paket Servis</span>
          </div>

          <div class="form-group">
            <label class="form-label">Keluhan Konsumen / Catatan Diagnosa <span class="required-star">*</span></label>
            <input
              v-model="form.keluhan"
              type="text"
              class="form-input"
              :class="{ 'has-error': fieldErrors.keluhan }"
              placeholder="Contoh: Tarikan gas berat, ganti oli rutin, rem belakang bunyi berdecit..."
              @input="clearFieldError('keluhan')"
            />
            <span v-if="fieldErrors.keluhan" class="form-error-msg">{{ fieldErrors.keluhan }}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Pilih Paket Jasa Servis</label>
              <select v-model="form.serviceMasterId" class="form-input">
                <option value="">-- Tanpa Paket Jasa Khusus --</option>
                <option v-for="service in serviceMasters" :key="service.id" :value="service.id" :disabled="!service.is_active">
                  {{ service.nama }} (±{{ service.estimasi_durasi || 30 }} mnt) — Rp {{ formatCurrency(service.harga) }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tugaskan Teknisi / Mekanik</label>
              <select v-model="form.mechanicName" class="form-input">
                <option value="">-- Masuk Antrean (Status Menunggu) --</option>
                <option v-for="mech in mechanics" :key="mech.id" :value="mech.nama">
                  {{ mech.nama }} ({{ mech.spesialisasi || 'Umum' }})
                </option>
              </select>
            </div>
          </div>

          <!-- Summary Estimasi SA -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 16px;">
            <div>
              <span style="font-size: 11.5px; color: #1e40af; font-weight: 600;">Estimasi Biaya Jasa Awal:</span>
              <div class="numeric" style="font-size: 16px; font-weight: 800; color: #1e3a8a;">
                Rp {{ formatCurrency(form.estimasiBiaya) }}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11.5px; color: #1e40af; font-weight: 600;">Estimasi Waktu Tunggu:</span>
              <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">
                ± {{ form.estimasiDurasi }} Menit
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="handleSubmit">
          <i class="ph-bold ph-check"></i> Simpan & Terbitkan PKB
        </button>
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
  serviceMasters: { type: Array, default: () => [] },
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
  kmMasuk: '',
  keluhan: '',
});

const submitError = ref('');

const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

const clearFieldError = (field) => {
  fieldErrors.value[field] = '';
  submitError.value = '';
};

const validateNopol = () => {
  const value = props.form.nopol ? props.form.nopol.trim().toUpperCase() : '';
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

const handleSubmit = () => {
  let hasError = false;
  const errors = { ...fieldErrors.value };

  if (!props.form.customerName || !props.form.customerName.trim()) {
    errors.customerName = 'Nama pelanggan wajib diisi';
    hasError = true;
  }
  if (!props.form.phone || !props.form.phone.trim()) {
    errors.phone = 'Nomor telepon wajib diisi';
    hasError = true;
  }
  if (!props.form.nopol || !props.form.nopol.trim()) {
    errors.nopol = 'Nomor polisi wajib diisi';
    hasError = true;
  } else if (!NOPOL_REGEX.test(props.form.nopol.trim().toUpperCase())) {
    errors.nopol = 'Format nomor polisi tidak valid (Contoh: B 1234 ABC)';
    hasError = true;
  }
  if (!props.form.brandName || !props.form.brandName.trim()) {
    errors.brandName = 'Merk motor wajib diisi';
    hasError = true;
  }
  if (!props.form.typeName || !props.form.typeName.trim()) {
    errors.typeName = 'Tipe motor wajib diisi';
    hasError = true;
  }
  if (props.form.kmMasuk === null || props.form.kmMasuk === undefined || props.form.kmMasuk < 0) {
    errors.kmMasuk = 'KM Odometer masuk wajib diisi';
    hasError = true;
  }
  if (!props.form.keluhan || !props.form.keluhan.trim()) {
    errors.keluhan = 'Keluhan wajib diisi';
    hasError = true;
  }

  fieldErrors.value = errors;

  if (hasError) {
    submitError.value = 'Harap lengkapi semua kolom bertanda bintang dengan benar.';
    return;
  }

  submitError.value = '';
  emit('submit');
};

watch(() => props.modelValue, (val) => {
  if (val) {
    fieldErrors.value = {
      customerName: '', phone: '', nopol: '',
      brandName: '', typeName: '', kmMasuk: '', keluhan: '',
    };
    submitError.value = '';
  }
});
</script>