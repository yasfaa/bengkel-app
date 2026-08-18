<template>
  <div v-if="modelValue && service" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 800px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="ph-bold ph-file-text" style="color: var(--primary-color); font-size: 20px;"></i>
          <h3>Perintah Kerja Bengkel (PKB) / Work Order</h3>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div class="modal-body" style="padding: 24px;">
        <!-- Official PKB Document Sheet (Borderless / Clean Document Style) -->
        <div class="pkb-document">
          <!-- 1. Header Bengkel & Identitas Dokumen -->
          <div class="pkb-header">
            <div class="workshop-identity">
              <div class="brand-title">
                <i class="ph-bold ph-wrench"></i>
                <span>BengkelKu Motor</span>
              </div>
              <div class="workshop-sub">
                Pusat Perawatan & Perbaikan Sepeda Motor
              </div>
              <div class="workshop-address">
                Jl. Raya Otomotif No. 88 • Telp: (021) 555-0123 • WA: 0812-9988-7766
              </div>
            </div>

            <div class="document-meta">
              <div class="document-title">SURAT PERINTAH KERJA (PKB)</div>
              <div class="pkb-number pkb-font">
                {{ service.nomorPkb || ('PKB-' + service.id) }}
              </div>
              <div class="meta-row">
                <span>Tgl Masuk:</span>
                <strong class="numeric">{{ formatDateTime(service.tgl_masuk) }}</strong>
              </div>
            </div>
          </div>

          <!-- 2. Grid Informasi Pelanggan & Kendaraan -->
          <div class="pkb-section-grid">
            <!-- Kolom Pelanggan -->
            <div class="pkb-box">
              <div class="box-title">
                IDENTITAS PELANGGAN
              </div>
              <table class="box-table">
                <tbody>
                  <tr>
                    <td style="width: 105px;">Nama Pemilik</td>
                    <td>: <strong>{{ service.customerName }}</strong></td>
                  </tr>
                  <tr>
                    <td>No. Telepon / WA</td>
                    <td>: <span class="numeric">{{ service.phone }}</span></td>
                  </tr>
                  <tr>
                    <td>Tipe Konsumen</td>
                    <td>: Konsumen Umum / Reguler</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Kolom Kendaraan -->
            <div class="pkb-box">
              <div class="box-title">
                DATA KENDARAAN (UNIT)
              </div>
              <table class="box-table">
                <tbody>
                  <tr>
                    <td style="width: 105px;">Nomor Polisi</td>
                    <td>: <strong class="nopol-font" style="font-size: 14px; color: #000000;">{{ service.nopol }}</strong></td>
                  </tr>
                  <tr>
                    <td>Merk / Tipe Motor</td>
                    <td>: {{ service.motorType }}</td>
                  </tr>
                  <tr>
                    <td>Warna / Tahun</td>
                    <td>: {{ service.warna || '-' }} / {{ service.tahunPembuatan || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. Checklist Reception & Kondisi Awal -->
          <div class="pkb-section-grid" style="margin-top: 10px;">
            <div class="pkb-box">
              <div class="box-title">
                CHECKLIST RECEPTION & FISIK
              </div>
              <table class="box-table">
                <tbody>
                  <tr>
                    <td style="width: 105px;">KM Odometer</td>
                    <td>: <strong class="numeric">{{ formatNumber(service.kmMasuk || service.km_masuk || 0) }} KM</strong></td>
                  </tr>
                  <tr>
                    <td>Indikator BBM</td>
                    <td>: <span class="fuel-badge">{{ service.levelBensin || service.level_bensin || '1/2' }}</span></td>
                  </tr>
                  <tr>
                    <td>Catatan Fisik</td>
                    <td>: {{ service.catatanKondisi || service.catatan_kondisi || 'Tidak ada catatan khusus' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pkb-box">
              <div class="box-title">
                ALOKASI KERJA & TEKNISI
              </div>
              <table class="box-table">
                <tbody>
                  <tr>
                    <td style="width: 105px;">Teknisi Pelaksana</td>
                    <td>: <strong>{{ service.mechanicName || 'Belum Ditugaskan (Antrean)' }}</strong></td>
                  </tr>
                  <tr>
                    <td>Keahlian / Spesialis</td>
                    <td>: {{ service.mechanicSpecialization || 'Umum & Tune Up' }}</td>
                  </tr>
                  <tr>
                    <td>Estimasi Durasi</td>
                    <td>: ± 30 - 45 Menit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. Uraian Keluhan & Estimasi Jasa Servis -->
          <div class="job-table-box" style="margin-top: 10px;">
            <div class="box-title" style="margin-bottom: 8px;">
              KELUHAN KONSUMEN & RINCIAN INSTRUKSI KERJA
            </div>

            <div class="complaint-banner">
              <strong>Keluhan Utama Konsumen:</strong>
              <div style="font-style: italic; margin-top: 2px; color: #111827;">
                "{{ service.keluhan }}"
              </div>
            </div>

            <table class="job-table">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">No</th>
                  <th>Uraian Pekerjaan / Paket Jasa Servis</th>
                  <th style="width: 120px; text-align: center;">Estimasi Waktu</th>
                  <th style="width: 150px; text-align: right;">Estimasi Biaya</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center;">1</td>
                  <td>
                    <strong>{{ service.servicePackageName || 'Servis & Perbaikan Berkala' }}</strong>
                    <div style="font-size: 11px; color: #4b5563;">
                      Inspeksi keluhan: {{ service.keluhan }}
                    </div>
                  </td>
                  <td style="text-align: center;" class="numeric">± 30 Menit</td>
                  <td style="text-align: right;" class="numeric">
                    Rp {{ formatCurrency(service.estimasiBiaya || service.estimasi_biaya || 0) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="3" style="text-align: right;">TOTAL ESTIMASI BIAYA AWAL JASA:</th>
                  <th style="text-align: right;" class="numeric total-amount">
                    Rp {{ formatCurrency(service.estimasiBiaya || service.estimasi_biaya || 0) }}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- 5. Syarat, Ketentuan & Surat Kuasa Hukum -->
          <div class="legal-clause">
            <div style="font-weight: 700; margin-bottom: 3px; color: #111827;">SYARAT & KETENTUAN PERJANJIAN KERJA (SURAT KUASA):</div>
            <ol style="padding-left: 14px; margin: 0;">
              <li>Pemilik kendaraan memberi kuasa penuh kepada pihak bengkel untuk melakukan perawatan, pembongkaran, dan uji jalan (*road test*) di luar area bengkel bila diperlukan.</li>
              <li>Penggantian suku cadang atau pekerjaan tambahan di luar PKB ini wajib dikonfirmasikan dan disetujui konsumen terlebih dahulu.</li>
              <li>Barang berharga di dalam bagasi wajib diambil. Bengkel tidak bertanggung jawab atas kehilangan barang pribadi yang tertinggal.</li>
              <li>Kendaraan yang selesai dikerjakan wajib diambil maksimal 14 hari kerja setelah konfirmasi selesai.</li>
            </ol>
          </div>

          <!-- 6. 3 Kolom Tanda Tangan Resmi -->
          <div class="signature-section">
            <div class="signature-item">
              <div class="sig-title">Konsumen / Pemilik Unit</div>
              <div class="sig-sub">(Menyetujui PKB & Estimasi)</div>
              <div class="sig-space"></div>
              <div class="sig-name">( {{ service.customerName }} )</div>
            </div>

            <div class="signature-item">
              <div class="sig-title">Service Advisor (SA)</div>
              <div class="sig-sub">(Frontdesk & Inspeksi)</div>
              <div class="sig-space"></div>
              <div class="sig-name">( Petugas SA )</div>
            </div>

            <div class="signature-item">
              <div class="sig-title">Teknisi / Mekanik</div>
              <div class="sig-sub">(Pelaksana Pengerjaan)</div>
              <div class="sig-space"></div>
              <div class="sig-name">( {{ service.mechanicName || 'Teknisi Pit' }} )</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Tutup</button>
        <button class="btn btn-primary" @click="handlePrint">
          <i class="ph-bold ph-printer"></i> Cetak Dokumen PKB (PDF/Print)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  service: { type: Object, default: null },
  formatCurrency: { type: Function, default: (val) => new Intl.NumberFormat('id-ID').format(val || 0) },
  getStatusBadgeClass: { type: Function, default: () => 'badge-pending' },
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

const formatNumber = (val) => {
  return new Intl.NumberFormat('id-ID').format(val || 0);
};

const handlePrint = () => {
  window.print();
};
</script>

<style scoped>
/* PKB Document Sheet Layout - Borderless Clean Paper */
.pkb-document {
  background: #ffffff;
  color: #111827;
  padding: 0;
  border: none;
  font-size: 12.5px;
  line-height: 1.45;
  box-sizing: border-box;
  width: 100%;
}

/* Header Section */
.pkb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 2px solid #111827;
  margin-bottom: 12px;
}

.workshop-identity .brand-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
}

.workshop-identity .workshop-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: #374151;
  margin-top: 1px;
}

.workshop-identity .workshop-address {
  font-size: 10.5px;
  color: #4b5563;
  margin-top: 3px;
}

.document-meta {
  text-align: right;
}

.document-meta .document-title {
  font-size: 12px;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.04em;
}

.document-meta .pkb-number {
  font-size: 15px;
  font-weight: 800;
  color: #000000;
  margin: 2px 0 4px 0;
}

.document-meta .meta-row {
  font-size: 11px;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

/* Grid Sections */
.pkb-section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pkb-box {
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 10px 12px;
}

.box-title {
  font-size: 11px;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.03em;
  margin-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 4px;
}

.box-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}

.box-table td {
  padding: 2px 0;
  vertical-align: top;
  color: #1f2937;
}

.fuel-badge {
  background: #f3f4f6;
  color: #111827;
  border: 1px solid #d1d5db;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
}

/* Job & Complaint Section */
.job-table-box {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 10px 12px;
  background: #ffffff;
}

.complaint-banner {
  background: #f9fafb;
  border-left: 3px solid #374151;
  padding: 6px 10px;
  font-size: 11.5px;
  margin-bottom: 10px;
  border-radius: 0 4px 4px 0;
}

.job-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}

.job-table th {
  background: #f3f4f6;
  color: #111827;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  font-weight: 700;
  font-size: 11px;
}

.job-table td {
  padding: 8px;
  border: 1px solid #d1d5db;
  vertical-align: middle;
  color: #1f2937;
}

.job-table tfoot th {
  background: #f9fafb;
  padding: 8px;
  border: 1px solid #d1d5db;
  color: #111827;
}

.total-amount {
  font-size: 13px;
  font-weight: 800;
  color: #000000;
}

/* Legal Clause */
.legal-clause {
  margin-top: 10px;
  font-size: 9.5px;
  color: #4b5563;
  line-height: 1.35;
  background: #f9fafb;
  padding: 8px 10px;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
}

/* Signatures */
.signature-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 14px;
  text-align: center;
}

.signature-item {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 6px;
  background: #ffffff;
}

.sig-title {
  font-weight: 700;
  font-size: 11px;
  color: #111827;
}

.sig-sub {
  font-size: 9.5px;
  color: #6b7280;
}

.sig-space {
  height: 44px;
}

.sig-name {
  font-weight: 700;
  font-size: 11px;
  color: #111827;
  border-top: 1px dashed #9ca3af;
  padding-top: 4px;
}

/* Print Overrides - Borderless Full Page */
@media print {
  .pkb-document {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    page-break-inside: avoid !important;
  }
}
</style>
