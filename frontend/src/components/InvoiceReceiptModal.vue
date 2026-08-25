<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div
      class="modal-card receipt-modal-card"
      :style="{ maxWidth: printMode === 'ncr' ? '820px' : '480px', width: '100%' }"
    >
      <!-- Modal Header -->
      <div class="modal-header no-print">
        <div style="display: flex; align-items: center; gap: 10px">
          <div
            style="
              width: 36px;
              height: 36px;
              border-radius: 8px;
              background: #ecfdf5;
              color: #059669;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            "
          >
            <i class="ph-bold ph-receipt"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800">
              Nota & Faktur Pembayaran Bengkel
            </h3>
            <span style="font-size: 12px; color: var(--text-muted)">
              Bukti Pembayaran Lunas, Kartu Garansi & Surat Jalan Kendaraan
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px">
          <!-- Format Switcher (NCR 3-Ply vs Struk Termal) -->
          <div
            style="
              background: #f1f5f9;
              padding: 3px;
              border-radius: 8px;
              display: flex;
              gap: 4px;
              font-size: 12px;
            "
          >
            <button
              :class="['btn', printMode === 'ncr' ? 'btn-primary' : 'btn-secondary']"
              style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border: none"
              @click="printMode = 'ncr'"
            >
              <i class="ph-bold ph-file-text"></i> Nota NCR Rangkap 3
            </button>
            <button
              :class="['btn', printMode === 'thermal' ? 'btn-primary' : 'btn-secondary']"
              style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border: none"
              @click="printMode = 'thermal'"
            >
              <i class="ph-bold ph-printer"></i> Struk 80mm
            </button>
          </div>

          <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
        </div>
      </div>

      <!-- Modal Body -->
      <div
        v-if="invoice"
        class="modal-body receipt-content"
        style="padding: 16px 20px; max-height: 78vh; overflow-y: auto"
      >
        <!-- ================================================================= -->
        <!-- FORMAT 1: NOTA FAKTUR NCR 3-PLY / SURAT JALAN BENGKEL (DEFAULT)    -->
        <!-- ================================================================= -->
        <div v-if="printMode === 'ncr'" id="printable-ncr" class="ncr-invoice-paper">
          <!-- Header Perusahaan & Nota Title -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 12px;
            "
          >
            <div>
              <div style="display: flex; align-items: center; gap: 6px">
                <i class="ph-fill ph-wrench" style="color: #2563eb; font-size: 22px"></i>
                <h2
                  style="
                    margin: 0;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    color: #0f172a;
                  "
                >
                  BENGKELKU MOTOR
                </h2>
              </div>
              <p style="margin: 2px 0 0 0; font-size: 11.5px; color: #475569">
                Pusat Servis Berkala, Injeksi, Suku Cadang & Overhaul Resmi
              </p>
              <p style="margin: 1px 0 0 0; font-size: 11px; color: #64748b">
                Jl. Raya Otomotif No. 88, Jakarta Selatan &bull; Hotline / WA: 0812-3456-7890
              </p>
            </div>

            <div style="text-align: right">
              <div
                style="
                  display: inline-block;
                  border: 2px solid #059669;
                  color: #059669;
                  padding: 2px 10px;
                  font-weight: 900;
                  font-size: 14px;
                  border-radius: 4px;
                  letter-spacing: 1px;
                  transform: rotate(-2deg);
                  margin-bottom: 4px;
                "
              >
                LUNAS / PAID
              </div>
              <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a">
                FAKTUR SERVIS & SURAT JALAN
              </h3>
              <span class="pkb-font" style="font-size: 13px; font-weight: 800; color: #2563eb">
                {{ invoice.noInvoice || invoice.nomorInvoice }}
              </span>
            </div>
          </div>

          <!-- Metadata 2-Column Grid -->
          <div
            style="
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 14px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 10px 14px;
              margin-bottom: 14px;
              font-size: 12px;
              line-height: 1.6;
            "
          >
            <!-- Left: Customer & Vehicle -->
            <div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">No. Polisi (Nopol):</span>
                <strong class="nopol-font" style="color: #2563eb; font-size: 13px">{{
                  invoice.nopol || invoice.service?.nopol
                }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Nama Pemilik / Pelanggan:</span>
                <strong style="color: #0f172a">{{
                  invoice.customerName || invoice.service?.customerName
                }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Tipe Motor / Kendaraan:</span>
                <span>{{ invoice.service?.motorType || '-' }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">No. Handphone / WA:</span>
                <span>{{ invoice.phone || invoice.service?.phone || '-' }}</span>
              </div>
            </div>

            <!-- Right: Service Order & Time -->
            <div style="border-left: 1px solid #e2e8f0; padding-left: 14px">
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">No. PKB:</span>
                <strong class="pkb-font" style="color: #475569">{{
                  invoice.service?.nomorPkb || 'PKB-' + (invoice.service?.id || invoice.serviceId)
                }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Tanggal & Waktu:</span>
                <span>{{ formatDate(invoice.tglBayar || invoice.createdAt) }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Teknisi / Mekanik:</span>
                <strong style="color: #0f172a">{{
                  invoice.service?.mechanicName || 'Teknisi Umum'
                }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Kasir / Frontdesk:</span>
                <span>{{ invoice.kasir?.nama || invoice.kasir?.username || 'Kasir Loket' }}</span>
              </div>
            </div>
          </div>

          <!-- Itemized Table (Jasa + Suku Cadang) -->
          <table
            class="ncr-table"
            style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px"
          >
            <thead>
              <tr
                style="
                  background: #f1f5f9;
                  border-top: 1px solid #0f172a;
                  border-bottom: 1px solid #0f172a;
                "
              >
                <th style="padding: 6px 8px; text-align: center; width: 35px">No</th>
                <th style="padding: 6px 8px; text-align: left">
                  Deskripsi Pekerjaan / Suku Cadang
                </th>
                <th style="padding: 6px 8px; text-align: center; width: 90px">Kategori</th>
                <th style="padding: 6px 8px; text-align: center; width: 50px">Qty</th>
                <th style="padding: 6px 8px; text-align: right; width: 110px">Harga Satuan</th>
                <th style="padding: 6px 8px; text-align: right; width: 120px">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <!-- Base Package Service Row -->
              <tr style="border-bottom: 1px solid #e2e8f0">
                <td style="padding: 6px 8px; text-align: center">1</td>
                <td style="padding: 6px 8px">
                  <strong>{{ invoice.service?.basePackageName || 'Paket Servis Dasar' }}</strong>
                  <div style="font-size: 10.5px; color: #64748b">
                    Jasa Paket Pemeriksaan & Tune-up Standar Bengkel
                  </div>
                </td>
                <td style="padding: 6px 8px; text-align: center">
                  <span
                    style="
                      background: #e0e7ff;
                      color: #3730a3;
                      padding: 2px 6px;
                      border-radius: 4px;
                      font-size: 10px;
                      font-weight: 700;
                    "
                    >JASA UTAMA</span
                  >
                </td>
                <td style="padding: 6px 8px; text-align: center; font-weight: 700">1</td>
                <td style="padding: 6px 8px; text-align: right">
                  Rp {{ formatCurrency(invoice.service?.basePackagePrice || 0) }}
                </td>
                <td style="padding: 6px 8px; text-align: right; font-weight: 700">
                  Rp {{ formatCurrency(invoice.service?.basePackagePrice || 0) }}
                </td>
              </tr>

              <!-- Approved Parts and Extra Services -->
              <tr
                v-for="(item, idx) in invoice.service?.serviceItems || []"
                :key="item.id"
                style="border-bottom: 1px solid #e2e8f0"
              >
                <td style="padding: 6px 8px; text-align: center">{{ idx + 2 }}</td>
                <td style="padding: 6px 8px">
                  <div style="font-weight: 600; color: #0f172a">{{ item.namaItem }}</div>
                  <div v-if="item.kodePart" style="font-size: 10.5px; color: #64748b">
                    Kode Part: {{ item.kodePart }}
                  </div>
                </td>
                <td style="padding: 6px 8px; text-align: center">
                  <span
                    :style="{
                      background: item.itemType === 'SPAREPART' ? '#f0fdf4' : '#fef3c7',
                      color: item.itemType === 'SPAREPART' ? '#166534' : '#92400e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                    }"
                  >
                    {{ item.itemType === 'SPAREPART' ? 'PART BARU' : 'JASA EKSTRA' }}
                  </span>
                </td>
                <td style="padding: 6px 8px; text-align: center; font-weight: 700">
                  {{ item.quantity }}
                </td>
                <td style="padding: 6px 8px; text-align: right">
                  Rp {{ formatCurrency(item.hargaSatuan) }}
                </td>
                <td style="padding: 6px 8px; text-align: right; font-weight: 700">
                  Rp {{ formatCurrency(item.subtotal) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Financial Calculation & Warranty Grid -->
          <div
            style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-bottom: 12px"
          >
            <!-- Left Box: Warranty & Notes -->
            <div
              style="
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 11px;
                line-height: 1.5;
                background: #fafafa;
              "
            >
              <div
                style="
                  font-weight: 800;
                  color: #1e293b;
                  margin-bottom: 3px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                "
              >
                <i class="ph-bold ph-shield-check" style="color: #059669"></i> KETENTUAN GARANSI &
                SURAT JALAN
              </div>
              <div>
                &bull; <strong>Garansi Servis Resmi</strong>: {{ warrantyDays }} Hari /
                {{ warrantyKm }} KM (Berlaku s/d <strong>{{ warrantyExpiryDate }}</strong
                >).
              </div>
              <div>
                &bull; <strong>Jadwal Servis Berkala Berikutnya</strong>: Rekomendasi
                <strong>{{ nextServiceDate }}</strong> (+2.000 KM).
              </div>
              <div>
                &bull; <strong>Suku Cadang Bekas</strong>: Telah diserahkan kembali kepada pemilik
                kendaraan.
              </div>
              <div style="font-style: italic; color: #64748b; margin-top: 2px">
                *Klaim garansi wajib menunjukkan lembar faktur asli ini.
              </div>
            </div>

            <!-- Right Box: Financial Summary -->
            <div
              style="
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 12px;
                line-height: 1.6;
                background: #ffffff;
              "
            >
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Total Jasa Servis:</span>
                <span class="numeric">Rp {{ formatCurrency(invoice.totalJasa) }}</span>
              </div>
              <div style="display: flex; justify-content: space-between">
                <span style="color: #64748b">Total Suku Cadang:</span>
                <span class="numeric">Rp {{ formatCurrency(invoice.totalSparepart) }}</span>
              </div>
              <div
                v-if="invoice.diskon > 0"
                style="display: flex; justify-content: space-between; color: #dc2626"
              >
                <span>Diskon / Potongan:</span>
                <span class="numeric">- Rp {{ formatCurrency(invoice.diskon) }}</span>
              </div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-weight: 900;
                  font-size: 14px;
                  border-top: 2px solid #0f172a;
                  padding-top: 4px;
                  margin-top: 4px;
                  color: #0f172a;
                "
              >
                <span>GRAND TOTAL:</span>
                <span class="numeric" style="color: #059669"
                  >Rp {{ formatCurrency(invoice.total) }}</span
                >
              </div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 11px;
                  margin-top: 2px;
                  color: #475569;
                "
              >
                <span>Metode Pembayaran:</span>
                <strong>{{ invoice.metodeBayar }}</strong>
              </div>
              <div
                v-if="invoice.metodeBayar === 'Tunai'"
                style="display: flex; justify-content: space-between; font-size: 11px"
              >
                <span>Tunai / Kembalian:</span>
                <span
                  >Rp {{ formatCurrency(invoice.uangDiterima) }} /
                  <strong>Rp {{ formatCurrency(invoice.kembalian) }}</strong></span
                >
              </div>
            </div>
          </div>

          <!-- Signatures Section (3 Kolom Surat Jalan) -->
          <div
            style="
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
              text-align: center;
              font-size: 11px;
              margin-top: 14px;
              padding-top: 6px;
              border-top: 1px dashed #cbd5e1;
            "
          >
            <div>
              <div style="color: #64748b">Penerima / Konsumen,</div>
              <div style="height: 44px"></div>
              <div
                style="
                  font-weight: 700;
                  border-top: 1px solid #94a3b8;
                  display: inline-block;
                  min-width: 140px;
                "
              >
                ( {{ invoice.customerName || invoice.service?.customerName || 'Konsumen' }} )
              </div>
            </div>
            <div>
              <div style="color: #64748b">Teknisi / Mekanik,</div>
              <div style="height: 44px"></div>
              <div
                style="
                  font-weight: 700;
                  border-top: 1px solid #94a3b8;
                  display: inline-block;
                  min-width: 140px;
                "
              >
                ( {{ invoice.service?.mechanicName || 'Mekanik' }} )
              </div>
            </div>
            <div>
              <div style="color: #64748b">Kasir / Service Advisor,</div>
              <div style="height: 44px"></div>
              <div
                style="
                  font-weight: 700;
                  border-top: 1px solid #94a3b8;
                  display: inline-block;
                  min-width: 140px;
                "
              >
                ( {{ invoice.kasir?.nama || invoice.kasir?.username || 'Kasir Bengkel' }} )
              </div>
            </div>
          </div>

          <!-- NCR 3-Ply Bottom Legend -->
          <div
            style="
              margin-top: 14px;
              padding-top: 6px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
              color: #64748b;
            "
          >
            <span><strong>Lembar 1 (Putih)</strong>: Konsumen / Garansi</span>
            <span><strong>Lembar 2 (Merah/Kuning)</strong>: Arsip Keuangan & Kasir</span>
            <span><strong>Lembar 3 (Hijau/Biru)</strong>: Arsip Gudang & Bengkel</span>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- FORMAT 2: STRUK POS THERMAL 80MM (COMPACT OPTIONAL)               -->
        <!-- ================================================================= -->
        <div
          v-else
          id="printable-thermal"
          class="receipt-paper"
          style="max-width: 360px; margin: 0 auto"
        >
          <!-- Workshop Header -->
          <div style="text-align: center; margin-bottom: 12px">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px">
              <i class="ph-fill ph-wrench" style="color: #2563eb; font-size: 20px"></i>
              <h2 style="margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -0.5px">
                BENGKELKU MOTOR
              </h2>
            </div>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b">
              Jl. Raya Otomotif No. 88, Jakarta &bull; (021) 789-0123
            </p>
            <div style="border-bottom: 2px dashed #cbd5e1; margin: 8px auto; width: 100%"></div>
          </div>

          <!-- Metadata -->
          <div style="font-size: 11.5px; line-height: 1.5; margin-bottom: 10px">
            <div style="display: flex; justify-content: space-between">
              <span style="color: #64748b">Invoice:</span>
              <strong style="color: #0f172a">{{
                invoice.noInvoice || invoice.nomorInvoice
              }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span style="color: #64748b">Nopol:</span>
              <strong class="nopol-font" style="color: #2563eb">{{
                invoice.nopol || invoice.service?.nopol
              }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span style="color: #64748b">Pelanggan:</span>
              <span>{{ invoice.customerName || invoice.service?.customerName }}</span>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span style="color: #64748b">Tanggal:</span>
              <span>{{ formatDate(invoice.tglBayar || invoice.createdAt) }}</span>
            </div>
          </div>

          <!-- Table -->
          <div
            style="
              border-top: 1px dashed #cbd5e1;
              border-bottom: 1px dashed #cbd5e1;
              padding: 8px 0;
              margin-bottom: 10px;
              font-size: 11.5px;
            "
          >
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
              <div>
                <div style="font-weight: 600">
                  {{ invoice.service?.basePackageName || 'Paket Servis Dasar' }}
                </div>
                <div style="font-size: 10px; color: #64748b">Jasa Servis Berkala</div>
              </div>
              <span class="numeric" style="font-weight: 600"
                >Rp {{ formatCurrency(invoice.service?.basePackagePrice || 0) }}</span
              >
            </div>

            <div
              v-for="item in invoice.service?.serviceItems || []"
              :key="item.id"
              style="display: flex; justify-content: space-between; margin-bottom: 4px"
            >
              <div>
                <div style="font-weight: 600">{{ item.namaItem }}</div>
                <div style="font-size: 10px; color: #64748b">
                  {{ item.quantity }} x Rp {{ formatCurrency(item.hargaSatuan) }}
                </div>
              </div>
              <span class="numeric" style="font-weight: 600"
                >Rp {{ formatCurrency(item.subtotal) }}</span
              >
            </div>
          </div>

          <!-- Summary -->
          <div style="font-size: 11.5px; line-height: 1.6; margin-bottom: 10px">
            <div style="display: flex; justify-content: space-between">
              <span style="color: #64748b">Total Jasa:</span>
              <span class="numeric">Rp {{ formatCurrency(invoice.totalJasa) }}</span>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span style="color: #64748b">Total Part:</span>
              <span class="numeric">Rp {{ formatCurrency(invoice.totalSparepart) }}</span>
            </div>
            <div
              v-if="invoice.diskon > 0"
              style="display: flex; justify-content: space-between; color: #dc2626"
            >
              <span>Diskon:</span>
              <span class="numeric">- Rp {{ formatCurrency(invoice.diskon) }}</span>
            </div>
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-weight: 800;
                font-size: 13.5px;
                border-top: 1px solid #e2e8f0;
                padding-top: 4px;
                margin-top: 2px;
              "
            >
              <span>GRAND TOTAL:</span>
              <span class="numeric" style="color: #059669"
                >Rp {{ formatCurrency(invoice.total) }}</span
              >
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 2px">
              <span style="color: #64748b">Metode:</span>
              <strong>{{ invoice.metodeBayar }}</strong>
            </div>
          </div>

          <!-- Thermal Footer -->
          <div
            style="
              text-align: center;
              font-size: 9.5px;
              color: #64748b;
              border-top: 1px dashed #cbd5e1;
              padding-top: 8px;
            "
          >
            <p style="margin: 0 0 2px 0; font-weight: 700; color: #334155">
              GARANSI SERVIS {{ warrantyDays }} HARI / {{ warrantyKm }} KM
            </p>
            <p style="margin: 0">Suku cadang bekas telah diserahkan.</p>
            <p style="margin: 2px 0 0 0; font-weight: 600; color: #0f172a">*** TERIMA KASIH ***</p>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="modal-footer no-print"
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Tutup</button>

        <div style="display: flex; gap: 8px">
          <!-- WhatsApp Direct Reminder Button -->
          <a
            v-if="whatsappUrl"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary"
            style="background: #25d366; color: #ffffff; border-color: #25d366; font-weight: 700"
            title="Kirim Ringkasan Faktur & Bukti Garansi ke WhatsApp Konsumen"
          >
            <i class="ph-bold ph-whatsapp-logo"></i> Kirim WA
          </a>

          <!-- Print Button -->
          <button
            class="btn btn-primary"
            style="background: #059669; border-color: #059669; font-weight: 700"
            @click="printInvoice"
          >
            <i class="ph-bold ph-printer"></i>
            {{ printMode === 'ncr' ? 'Cetak Nota NCR 3-Ply' : 'Cetak Struk 80mm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  invoice: { type: Object, default: null },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['update:modelValue']);

// Print mode: 'ncr' (Nota NCR Rangkap 3 / Surat Jalan) vs 'thermal' (Struk POS 80mm)
const printMode = ref('ncr');

const formatDate = (dateStr) => {
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

// Stage 6: Garansi Servis Calculations
const isHeavyService = computed(() => {
  const pkg = (props.invoice?.service?.basePackageName || '').toLowerCase();
  return pkg.includes('berat') || pkg.includes('turun mesin') || pkg.includes('overhaul');
});

const warrantyDays = computed(() => (isHeavyService.value ? 30 : 7));
const warrantyKm = computed(() => (isHeavyService.value ? 1000 : 500));

const warrantyExpiryDate = computed(() => {
  const baseDate = props.invoice?.tglBayar || props.invoice?.createdAt || new Date();
  const d = new Date(baseDate);
  d.setDate(d.getDate() + warrantyDays.value);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
});

const nextServiceDate = computed(() => {
  const baseDate = props.invoice?.tglBayar || props.invoice?.createdAt || new Date();
  const d = new Date(baseDate);
  d.setDate(d.getDate() + 60); // 2 months
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
});

// Stage 6: Direct WhatsApp Notification Generator
const whatsappUrl = computed(() => {
  const phone = props.invoice?.phone || props.invoice?.service?.phone;
  if (!phone) return null;

  let sanitized = phone.replace(/[^0-9]/g, '');
  if (sanitized.startsWith('08')) {
    sanitized = '628' + sanitized.substring(2);
  } else if (sanitized.startsWith('8')) {
    sanitized = '628' + sanitized.substring(1);
  }

  const customer =
    props.invoice?.customerName || props.invoice?.service?.customerName || 'Konsumen';
  const nopol = props.invoice?.nopol || props.invoice?.service?.nopol || '';
  const invNo = props.invoice?.noInvoice || props.invoice?.nomorInvoice || '';
  const total = props.formatCurrency(props.invoice?.total || 0);

  const message =
    `Halo Kak ${customer}, terima kasih telah melakukan servis di *BengkelKu Motor* 🛵🔧.\n\n` +
    `*FAKTUR SERVIS & SURAT JALAN:*\n` +
    `• No. Invoice: ${invNo}\n` +
    `• No. Polisi: ${nopol}\n` +
    `• Total Tagihan: Rp ${total} (LUNAS)\n\n` +
    `*KARTU GARANSI:*\n` +
    `• Masa Garansi: ${warrantyDays.value} Hari / ${warrantyKm.value} KM (hingga ${warrantyExpiryDate.value})\n` +
    `• Rekomendasi Servis Rutin Berikutnya: ${nextServiceDate.value}\n\n` +
    `Simpan pesan ini sebagai bukti garansi resmi dan surat jalan motor Anda. Terima kasih! 🙏`;

  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
});

const printInvoice = () => {
  window.print();
};
</script>

<style scoped>
.ncr-invoice-paper {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printable-ncr,
  #printable-ncr *,
  #printable-thermal,
  #printable-thermal * {
    visibility: visible;
  }
  #printable-ncr {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 15px;
    background: #ffffff !important;
    color: #000000 !important;
    border: none !important;
  }
  #printable-thermal {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0;
    padding: 10px;
    background: #ffffff !important;
    color: #000000 !important;
    font-family: 'Courier New', Courier, monospace !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>
