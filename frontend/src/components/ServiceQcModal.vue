<template>
  <div
    v-if="modelValue && service"
    class="modal-backdrop"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal-card" style="max-width: 600px">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px">
          <div class="qc-header-emblem">
            <i class="ph-bold ph-seal-check"></i>
          </div>
          <div>
            <h3>Pemeriksaan Akhir & Kendali Mutu (QC)</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px">
              Verifikasi kelayakan motor sebelum diserahkan ke kasir
            </p>
          </div>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body">
        <!-- Vehicle & PKB Summary Card -->
        <div class="section-card" style="margin-bottom: 20px; padding: 14px 16px">
          <div style="display: flex; justify-content: space-between; align-items: flex-start">
            <div>
              <div style="display: flex; align-items: center; gap: 8px">
                <span
                  class="pkb-font"
                  style="font-size: 13px; font-weight: 800; color: var(--primary-color)"
                >
                  {{ service.nomorPkb }}
                </span>
                <span
                  class="nopol-font"
                  style="font-size: 16px; font-weight: 800; color: var(--text-main)"
                >
                  {{ service.nopol }}
                </span>
              </div>
              <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 3px">
                <strong>{{ service.motorType }}</strong> • {{ service.customerName }}
              </div>
            </div>
            <span class="badge badge-working">Pemeriksaan QC</span>
          </div>

          <div
            v-if="service.keluhan"
            style="
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px dashed var(--border-subtle);
              font-size: 12px;
              color: var(--text-secondary);
            "
          >
            <strong>Keluhan Utama:</strong> {{ service.keluhan }}
          </div>
        </div>

        <!-- QC SOP Checklist Group -->
        <div class="form-group">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            "
          >
            <label
              class="form-label"
              style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 0"
            >
              Daftar Periksa Standard (SOP Bengkel)
            </label>
            <span style="font-size: 11.5px; color: var(--text-muted)">
              {{ checkedCount }} / 5 Butir Selesai
            </span>
          </div>

          <div class="qc-checklist">
            <!-- 1. Kelistrikan -->
            <div
              :class="['qc-item', { active: form.kelistrikan_ok }]"
              @click="form.kelistrikan_ok = !form.kelistrikan_ok"
            >
              <div class="qc-checkbox-wrapper">
                <div :class="['qc-custom-box', { checked: form.kelistrikan_ok }]">
                  <i v-if="form.kelistrikan_ok" class="ph-bold ph-check"></i>
                </div>
              </div>
              <div class="qc-label-box">
                <div class="qc-title">1. Fungsi Kelistrikan & Penerangan</div>
                <div class="qc-desc">
                  Lampu utama, sein kiri/kanan, klakson, starter, dan switch rem.
                </div>
              </div>
              <div class="qc-status-badge">
                <span v-if="form.kelistrikan_ok" class="badge badge-done" style="font-size: 10.5px"
                  >LULUS</span
                >
                <span v-else class="badge badge-pending" style="font-size: 10.5px">BELUM</span>
              </div>
            </div>

            <!-- 2. Pengereman -->
            <div :class="['qc-item', { active: form.rem_ok }]" @click="form.rem_ok = !form.rem_ok">
              <div class="qc-checkbox-wrapper">
                <div :class="['qc-custom-box', { checked: form.rem_ok }]">
                  <i v-if="form.rem_ok" class="ph-bold ph-check"></i>
                </div>
              </div>
              <div class="qc-label-box">
                <div class="qc-title">2. Pengereman Depan & Belakang</div>
                <div class="qc-desc">
                  Jarak main handel rem, kepakeman kampas rem, dan minyak rem.
                </div>
              </div>
              <div class="qc-status-badge">
                <span v-if="form.rem_ok" class="badge badge-done" style="font-size: 10.5px"
                  >LULUS</span
                >
                <span v-else class="badge badge-pending" style="font-size: 10.5px">BELUM</span>
              </div>
            </div>

            <!-- 3. Respon Gas -->
            <div :class="['qc-item', { active: form.gas_ok }]" @click="form.gas_ok = !form.gas_ok">
              <div class="qc-checkbox-wrapper">
                <div :class="['qc-custom-box', { checked: form.gas_ok }]">
                  <i v-if="form.gas_ok" class="ph-bold ph-check"></i>
                </div>
              </div>
              <div class="qc-label-box">
                <div class="qc-title">3. Respon Gas & Putaran Mesin</div>
                <div class="qc-desc">
                  Langsam mesin stabil (idle), tarikan responsif tanpa brebet.
                </div>
              </div>
              <div class="qc-status-badge">
                <span v-if="form.gas_ok" class="badge badge-done" style="font-size: 10.5px"
                  >LULUS</span
                >
                <span v-else class="badge badge-pending" style="font-size: 10.5px">BELUM</span>
              </div>
            </div>

            <!-- 4. Uji Jalan -->
            <div
              :class="['qc-item', { active: form.test_ride_ok }]"
              @click="form.test_ride_ok = !form.test_ride_ok"
            >
              <div class="qc-checkbox-wrapper">
                <div :class="['qc-custom-box', { checked: form.test_ride_ok }]">
                  <i v-if="form.test_ride_ok" class="ph-bold ph-check"></i>
                </div>
              </div>
              <div class="qc-label-box">
                <div class="qc-title">4. Uji Jalan (Test Ride)</div>
                <div class="qc-desc">
                  Stabilitas kemudi (stang), suspensi, CVT / rantai tidak ada suara abnormal.
                </div>
              </div>
              <div class="qc-status-badge">
                <span v-if="form.test_ride_ok" class="badge badge-done" style="font-size: 10.5px"
                  >LULUS</span
                >
                <span v-else class="badge badge-pending" style="font-size: 10.5px">BELUM</span>
              </div>
            </div>

            <!-- 5. Part Bekas -->
            <div
              :class="['qc-item', { active: form.part_bekas_diserahkan }]"
              @click="form.part_bekas_diserahkan = !form.part_bekas_diserahkan"
            >
              <div class="qc-checkbox-wrapper">
                <div :class="['qc-custom-box', { checked: form.part_bekas_diserahkan }]">
                  <i v-if="form.part_bekas_diserahkan" class="ph-bold ph-check"></i>
                </div>
              </div>
              <div class="qc-label-box">
                <div class="qc-title">5. Penyerahan Suku Cadang Bekas</div>
                <div class="qc-desc">
                  Part lama yang diganti telah dikemas untuk diserahkan ke pelanggan.
                </div>
              </div>
              <div class="qc-status-badge">
                <span
                  v-if="form.part_bekas_diserahkan"
                  class="badge badge-done"
                  style="font-size: 10.5px"
                  >LULUS</span
                >
                <span v-else class="badge badge-pending" style="font-size: 10.5px">BELUM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group" style="margin-bottom: 0">
          <label class="form-label">Catatan Tambahan QC (Opsional)</label>
          <textarea
            v-model="form.catatan"
            class="form-input"
            rows="3"
            style="height: auto; padding: 10px 12px; font-size: 13px"
            placeholder="Misal: Spion kiri sedikit kendor karena drat bawaan sudah aus (di luar lingkup servis)"
          ></textarea>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="modal-footer"
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" @click="handleSubmit">
          <i class="ph-bold ph-check-circle"></i>
          <span>Simpan & Selesaikan Servis</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { SwalConfirm } from '../utils/swal';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  service: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const form = reactive({
  kelistrikan_ok: false,
  rem_ok: false,
  gas_ok: false,
  test_ride_ok: false,
  part_bekas_diserahkan: false,
  catatan: '',
});

const checkedCount = computed(() => {
  let count = 0;
  if (form.kelistrikan_ok) count++;
  if (form.rem_ok) count++;
  if (form.gas_ok) count++;
  if (form.test_ride_ok) count++;
  if (form.part_bekas_diserahkan) count++;
  return count;
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.kelistrikan_ok = false;
      form.rem_ok = false;
      form.gas_ok = false;
      form.test_ride_ok = false;
      form.part_bekas_diserahkan = false;
      form.catatan = '';
    }
  }
);

const handleSubmit = async () => {
  let htmlText = `Apakah Anda yakin hasil pemeriksaan kendali mutu (QC) untuk motor <strong>${props.service?.nopol || ''}</strong> telah selesai dan unit siap diserahkan ke Kasir?`;

  if (checkedCount.value < 5) {
    htmlText =
      `<div style="color: #b45309; font-weight: 600; margin-bottom: 8px;">⚠️ Perhatian: Hanya ${checkedCount.value} dari 5 butir SOP yang ditandai LULUS.</div>` +
      htmlText;
  }

  const result = await SwalConfirm.fire({
    title: 'Konfirmasi Selesai Servis & QC',
    html: htmlText,
    icon: checkedCount.value < 5 ? 'warning' : 'question',
    confirmButtonText: 'Ya, Selesaikan',
    cancelButtonText: 'Periksa Kembali',
  });

  if (result.isConfirmed) {
    emit('confirm', { ...form });
  }
};
</script>

<style scoped>
.qc-header-emblem {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--primary-subtle);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.section-card {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.qc-checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background-color: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.qc-item:hover {
  background-color: #f8fafc;
  border-color: var(--border-strong);
}

.qc-item.active {
  background-color: var(--primary-subtle);
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.08);
}

.qc-checkbox-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qc-custom-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border-strong);
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
}

.qc-item:hover .qc-custom-box {
  border-color: var(--primary-color);
}

.qc-custom-box.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.qc-label-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.qc-title {
  font-weight: 700;
  font-size: 13.5px;
  color: var(--text-main);
  transition: color 0.15s ease;
}

.qc-item.active .qc-title {
  color: #1e40af;
}

.qc-desc {
  font-size: 11.5px;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}

.qc-status-badge {
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
