<template>
  <div v-if="modelValue && service" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 720px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="ph-bold ph-file-text" style="color: var(--primary-color); font-size: 20px;"></i>
          <h3>Perintah Kerja Bengkel (PKB)</h3>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body printable-area">
        <!-- Official PKB Document Sheet -->
        <div class="pkb-document">
          <!-- PKB Header -->
          <div class="pkb-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="ph-bold ph-wrench" style="font-size: 22px; color: #2563eb;"></i>
                <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">BengkelKu</span>
              </div>
              <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">
                Sistem Manajemen Bengkel & Layanan Servis Resmi
              </div>
            </div>
            <div style="text-align: right;">
              <div class="pkb-font" style="font-size: 16px; font-weight: 800; color: #2563eb;">
                {{ service.nomorPkb || ('PKB-' + service.id) }}
              </div>
              <div class="numeric" style="font-size: 12px; color: #64748b;">
                Tgl Masuk: {{ formatDateTime(service.tgl_masuk) }}
              </div>
              <div style="margin-top: 4px;">
                <span :class="['badge', getStatusBadgeClass(service.status)]">
                  Status: {{ service.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Section Grid: Pelanggan & Kendaraan -->
          <div class="pkb-grid">
            <div class="pkb-info-box">
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                Data Pelanggan (Customer)
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">Nama:</span>
                <strong>{{ service.customerName }}</strong>
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">No. HP / WA:</span>
                <span class="numeric">{{ service.phone }}</span>
              </div>
            </div>

            <div class="pkb-info-box">
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                Data Kendaraan (Unit)
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">Nomor Polisi:</span>
                <strong class="nopol-font" style="color: #2563eb; font-size: 14px;">{{ service.nopol }}</strong>
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">Tipe Motor:</span>
                <span>{{ service.motorType }}</span>
              </div>
            </div>
          </div>

          <!-- Section Grid: Checklist Reception & Inspeksi SA -->
          <div class="pkb-grid">
            <div class="pkb-info-box">
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                Kondisi Awal (Inspeksi SA)
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">KM Odometer:</span>
                <strong class="numeric">{{ service.kmMasuk || service.km_masuk || 0 }} KM</strong>
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">Level Bahan Bakar:</span>
                <span class="badge badge-working">{{ service.levelBensin || service.level_bensin || '1/2' }}</span>
              </div>
              <div class="pkb-row" style="margin-top: 4px;">
                <span style="color: #64748b;">Catatan Fisik:</span>
                <span>{{ service.catatanKondisi || service.catatan_kondisi || '-' }}</span>
              </div>
            </div>

            <div class="pkb-info-box">
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">
                Penugasan Teknisi / Mekanik
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">Nama Teknisi:</span>
                <strong>{{ service.mechanicName || 'Belum Ditugaskan' }}</strong>
              </div>
              <div class="pkb-row">
                <span style="color: #64748b;">Spesialisasi:</span>
                <span>{{ service.mechanicSpecialization || 'Umum & Tune Up' }}</span>
              </div>
            </div>
          </div>

          <!-- Diagnosa & Keluhan Pelanggan -->
          <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">
              Keluhan Utama Konsumen & Instruksi Servis:
            </div>
            <div style="font-size: 14px; font-weight: 600; color: #0f172a;">
              "{{ service.keluhan }}"
            </div>
            <div v-if="service.servicePackageName" style="margin-top: 8px; font-size: 13px; color: #2563eb; font-weight: 700;">
              Paket Jasa: {{ service.servicePackageName }}
            </div>
          </div>

          <!-- Estimasi Biaya & Waktu -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 18px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 12px; color: #1e40af; font-weight: 600;">Estimasi Biaya Awal Jasa:</span>
              <div class="numeric" style="font-size: 18px; font-weight: 800; color: #1e3a8a;">
                Rp {{ formatCurrency(service.estimasiBiaya || service.estimasi_biaya || 0) }}
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: #1e40af; font-weight: 600;">Estimasi Durasi Pengerjaan:</span>
              <div style="font-size: 15px; font-weight: 700; color: #1e3a8a;">
                ± 30 - 45 Menit
              </div>
            </div>
          </div>

          <!-- Syarat & Ketentuan Servis Singkat -->
          <div style="font-size: 11px; color: #94a3b8; line-height: 1.4; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
            * Penggantian suku cadang tambahan di luar keluhan awal wajib dikonfirmasi dan disetujui konsumen terlebih dahulu.
            <br />
            * Barang berharga di dalam bagasi harap diambil oleh pemilik kendaraan. Bengkel tidak bertanggung jawab atas kehilangan barang pribadi.
          </div>

          <!-- Kolom Tanda Tangan Konsumen & SA -->
          <div class="signature-grid">
            <div>
              <div style="font-size: 12px; color: #64748b;">Konsumen / Pemilik Unit,</div>
              <div class="signature-box">
                ( {{ service.customerName }} )
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #64748b;">Service Advisor (SA) / Petugas,</div>
              <div class="signature-box">
                ( Petugas Frontdesk )
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Tutup</button>
        <button class="btn btn-primary" @click="handlePrint">
          <i class="ph-bold ph-printer"></i> Cetak Lembar PKB
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  service: { type: Object, default: null },
  formatCurrency: { type: Function, required: true },
  getStatusBadgeClass: { type: Function, required: true },
});

defineEmits(['update:modelValue']);

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handlePrint = () => {
  window.print();
};
</script>
