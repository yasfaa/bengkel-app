<template>
  <div
    v-if="modelValue && service"
    class="modal-backdrop"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal-card" style="max-width: 650px">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="ph-bold ph-git-merge" style="color: var(--primary-color); font-size: 20px"></i>
          <h3>Alokasi Pit & Penugasan Teknisi</h3>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="error-banner" style="margin-bottom: 16px">
          <div class="error-banner-content">
            <i class="ph-bold ph-warning-circle"></i>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <!-- 1. PKB Summary Card -->
        <div class="section-card" style="margin-bottom: 16px; padding: 14px 16px">
          <div style="display: flex; justify-content: space-between; align-items: flex-start">
            <div>
              <div style="display: flex; align-items: center; gap: 8px">
                <span
                  class="pkb-font"
                  style="font-size: 12.5px; font-weight: 800; color: var(--primary-color)"
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
              <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px">
                <strong>{{ service.motorType }}</strong> • {{ service.customerName }} ({{
                  service.phone
                }})
              </div>
            </div>
            <span class="badge badge-pending">{{ service.status }}</span>
          </div>

          <div
            style="
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px dashed var(--border-subtle);
              font-size: 12.5px;
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 6px;
            "
          >
            <div style="color: var(--text-secondary)">
              <strong>Keluhan:</strong> {{ service.keluhan }}
            </div>
            <div
              v-if="service.servicePackageName"
              style="color: var(--primary-color); font-weight: 600"
            >
              {{ service.servicePackageName }} (Rp {{ formatCurrency(service.estimasiBiaya) }})
            </div>
          </div>
        </div>

        <!-- 2. Alokasi Pit Bay -->
        <div class="form-group">
          <label class="form-label"
            >Pilih Pit Kerja (Bay) <span class="required-star">*</span></label
          >
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px">
            <button
              v-for="pit in pitOptions"
              :key="pit.id"
              type="button"
              :class="['brand-pill-btn', { active: selectedPit === pit.name }]"
              style="padding: 10px 14px; justify-content: flex-start; text-align: left"
              @click="selectedPit = pit.name"
            >
              <i :class="['ph-bold', pit.icon]"></i>
              <div>
                <div style="font-weight: 700; font-size: 13px">{{ pit.name }}</div>
                <div style="font-size: 11px; font-weight: 500; opacity: 0.8">{{ pit.desc }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 3. Pemilihan Teknisi / Mekanik -->
        <div class="form-group" style="margin-bottom: 0">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            "
          >
            <label class="form-label" style="margin-bottom: 0">
              Pilih Teknisi Pelaksana <span class="required-star">*</span>
            </label>
            <span style="font-size: 12px; color: var(--text-muted)">
              Standby: <strong style="color: #059669">{{ standbyCount }}</strong> /
              {{ mechanics.length }}
            </span>
          </div>

          <!-- Notice: Pilihan Berbeda dari Pilihan Awal Pelanggan -->
          <div
            v-if="
              service.mechanicName &&
              selectedMechanicName &&
              service.mechanicName !== selectedMechanicName
            "
            style="
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 8px;
              padding: 8px 12px;
              margin-bottom: 10px;
              font-size: 12px;
              color: #1e40af;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <i class="ph-bold ph-info" style="font-size: 15px"></i>
            <span
              >Pengalihan Teknisi dari <strong>{{ service.mechanicName }}</strong> ke
              <strong>{{ selectedMechanicName }}</strong></span
            >
          </div>

          <!-- Notice: Memilih Teknisi yang Sedang Bekerja -->
          <div
            v-if="selectedMechanicName && getMechanicStatus(selectedMechanicName) === 'Bekerja'"
            style="
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 8px;
              padding: 8px 12px;
              margin-bottom: 10px;
              font-size: 12px;
              color: #92400e;
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <i class="ph-bold ph-clock-countdown" style="font-size: 15px"></i>
            <span
              >{{ selectedMechanicName }} sedang aktif di motor
              <strong>{{ getPlatOnly(getMechanicActiveJob(selectedMechanicName)) }}</strong
              >. Anda dapat <strong>menugaskannya ke antrean berikutnya</strong>.</span
            >
          </div>

          <!-- Clean Grid Daftar Teknisi -->
          <div
            style="
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              max-height: 240px;
              overflow-y: auto;
              padding: 2px;
            "
          >
            <div
              v-for="mech in mechanics"
              :key="mech.id"
              :class="['mechanic-select-card', { active: selectedMechanicName === mech.nama }]"
              @click="selectMechanic(mech.nama)"
            >
              <div class="mechanic-card-left">
                <div class="mechanic-avatar-box">
                  <i class="ph-bold ph-user-gear"></i>
                </div>
                <div class="mechanic-info">
                  <div class="mechanic-name-row">
                    <span class="mechanic-name-text">{{ mech.nama }}</span>
                    <span
                      v-if="service.mechanicName === mech.nama"
                      class="badge"
                      style="
                        background: #e0f2fe;
                        color: #0369a1;
                        font-size: 9.5px;
                        padding: 2px 5px;
                      "
                    >
                      Ditugaskan
                    </span>
                  </div>
                  <div class="mechanic-spec-text">
                    {{ mech.spesialisasi || 'Umum & Tune Up' }}
                  </div>
                </div>
              </div>

              <div class="mechanic-card-right">
                <span
                  v-if="getMechanicStatus(mech.nama) === 'Standby'"
                  class="badge badge-done"
                  style="font-size: 11px; padding: 3px 8px"
                >
                  <i class="ph-bold ph-check"></i> Standby
                </span>
                <span
                  v-else
                  class="badge badge-working"
                  style="font-size: 11px; padding: 3px 8px"
                  :title="getMechanicActiveJob(mech.nama)"
                >
                  <i class="ph-bold ph-gear"></i> Bekerja
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; gap: 8px">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>

        <div style="display: flex; gap: 8px">
          <!-- Action 1: Assign Only (Status stays Menunggu) -->
          <button
            type="button"
            class="btn btn-secondary"
            style="border-color: var(--primary-color); color: var(--primary-color)"
            title="Tugaskan teknisi namun biarkan status tetap Menunggu di antrean teknisi"
            @click="handleAssignOnly"
          >
            <i class="ph-bold ph-calendar-plus"></i>
            <span>Tugaskan Saja (Antre)</span>
          </button>

          <!-- Action 2: Start Working Immediately (Status -> Dikerjakan) -->
          <button type="button" class="btn btn-primary" @click="handleStartWorking">
            <i class="ph-bold ph-play"></i>
            <span>Mulai Servis Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { SwalConfirm } from '../utils/swal';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  service: { type: Object, default: null },
  mechanics: { type: Array, default: () => [] },
  getMechanicStatus: { type: Function, default: () => 'Standby' },
  getMechanicActiveJob: { type: Function, default: () => null },
  formatCurrency: {
    type: Function,
    default: (val) => new Intl.NumberFormat('id-ID').format(val || 0),
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const selectedPit = ref('Pit 1');
const selectedMechanicName = ref('');
const errorMessage = ref('');

const pitOptions = [
  { id: 1, name: 'Pit 1', desc: 'Servis Ringan & Tune Up', icon: 'ph-wrench' },
  { id: 2, name: 'Pit 2', desc: 'Servis Reguler & CVT', icon: 'ph-gear-fine' },
  { id: 3, name: 'Pit 3', desc: 'Quick Service & Ganti Oli', icon: 'ph-drop' },
  { id: 4, name: 'Pit 4', desc: 'Heavy Repair & Turun Mesin', icon: 'ph-engine' },
];

const standbyCount = computed(() => {
  return props.mechanics.filter((m) => props.getMechanicStatus(m.nama) === 'Standby').length;
});

const getPlatOnly = (activeJobStr) => {
  if (!activeJobStr) return '';
  return activeJobStr.split('(')[0].trim();
};

const selectMechanic = (name) => {
  selectedMechanicName.value = name;
  errorMessage.value = '';
};

watch(
  () => props.service,
  (newSvc) => {
    if (newSvc) {
      selectedMechanicName.value = newSvc.mechanicName || '';
      selectedPit.value = 'Pit 1';
      errorMessage.value = '';
    }
  },
  { immediate: true }
);

/**
 * Assign mechanic to queue without starting work immediately (Status: Menunggu)
 */
const handleAssignOnly = async () => {
  if (!selectedMechanicName.value) {
    errorMessage.value = 'Harap pilih teknisi pelaksana terlebih dahulu.';
    return;
  }

  // Confirm reassignment if different from initial
  if (props.service.mechanicName && props.service.mechanicName !== selectedMechanicName.value) {
    const reassignmentConfirm = await SwalConfirm.fire({
      title: 'Pengalihan Teknisi Pelaksana',
      html: `Motor <strong>${props.service.nopol}</strong> sebelumnya ditugaskan ke <strong>${props.service.mechanicName}</strong>.<br><br>Alihkan antrean ke <strong>${selectedMechanicName.value}</strong>?`,
      icon: 'question',
      confirmButtonText: 'Ya, Alihkan',
      cancelButtonText: 'Batal',
    });

    if (!reassignmentConfirm.isConfirmed) {
      return;
    }
  }

  emit('confirm', {
    service: props.service,
    mechanicName: selectedMechanicName.value,
    pitNumber: selectedPit.value,
    startWorking: false,
    allowBusyOverride: true,
  });
};

/**
 * Start working immediately on Pit Bay (Status: Dikerjakan)
 */
const handleStartWorking = async () => {
  if (!selectedMechanicName.value) {
    errorMessage.value = 'Harap pilih teknisi pelaksana terlebih dahulu sebelum memulai servis.';
    return;
  }

  // 1. Confirm reassignment if different
  if (props.service.mechanicName && props.service.mechanicName !== selectedMechanicName.value) {
    const reassignmentConfirm = await SwalConfirm.fire({
      title: 'Pengalihan Teknisi Pelaksana',
      html: `Pelanggan sebelumnya meminta teknisi <strong>${props.service.mechanicName}</strong>.<br><br>Apakah Anda yakin ingin mengalihkan pengerjaan motor <strong>${props.service.nopol}</strong> ke teknisi <strong>${selectedMechanicName.value}</strong>?`,
      icon: 'question',
      confirmButtonText: 'Ya, Alihkan & Mulai',
      cancelButtonText: 'Batal',
    });

    if (!reassignmentConfirm.isConfirmed) {
      return;
    }
  }

  // 2. Validate if mechanic is currently busy working
  if (props.getMechanicStatus(selectedMechanicName.value) === 'Bekerja') {
    const activePlat = getPlatOnly(props.getMechanicActiveJob(selectedMechanicName.value));
    const busyConfirm = await SwalConfirm.fire({
      title: 'Teknisi Sedang Mengerjakan Motor Lain!',
      html: `Teknisi <strong>${selectedMechanicName.value}</strong> saat ini sedang aktif mengerjakan motor <strong>${activePlat}</strong>.<br><br>Apakah Anda ingin tetap memulai pengerjaan unit ini sekarang?`,
      icon: 'warning',
      confirmButtonText: 'Ya, Tetap Mulai',
      cancelButtonText: 'Tugaskan Saja ke Antrean',
    });

    if (!busyConfirm.isConfirmed) {
      return;
    }
  }

  emit('confirm', {
    service: props.service,
    mechanicName: selectedMechanicName.value,
    pitNumber: selectedPit.value,
    startWorking: true,
    allowBusyOverride: true,
  });
};
</script>

<style scoped>
.section-card {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.brand-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1.5px solid var(--border-subtle);
  background: #ffffff;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.brand-pill-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-strong);
  color: var(--text-main);
}

.brand-pill-btn.active {
  background: #eff6ff;
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.mechanic-select-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.mechanic-select-card:hover {
  background: #f8fafc;
  border-color: var(--border-strong);
}

.mechanic-select-card.active {
  background: #eff6ff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18);
}

.mechanic-card-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.mechanic-avatar-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 17px;
  flex-shrink: 0;
}

.mechanic-select-card.active .mechanic-avatar-box {
  background: var(--primary-color);
  color: #ffffff;
}

.mechanic-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.mechanic-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mechanic-name-text {
  font-weight: 700;
  font-size: 13.5px;
  color: var(--text-main);
  white-space: nowrap;
}

.mechanic-spec-text {
  font-size: 11.5px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  margin-top: 1px;
}

.mechanic-card-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
