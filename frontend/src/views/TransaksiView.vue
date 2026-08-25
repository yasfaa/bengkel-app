<template>
  <div>
    <!-- Navigation Tabs for Kasir & POS -->
    <div
      style="
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 12px;
        width: fit-content;
      "
    >
      <button
        :class="['btn', activeTab === 'kasir' ? 'btn-primary' : 'btn-secondary']"
        style="padding: 8px 16px; font-size: 13px; font-weight: 700; border: none"
        @click="activeTab = 'kasir'"
      >
        <i class="ph-bold ph-receipt"></i>
        Kasir & Tagihan PKB
        <span
          v-if="unpaidCount > 0"
          style="
            background: #ef4444;
            color: #ffffff;
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 10px;
            margin-left: 6px;
          "
        >
          {{ unpaidCount }}
        </span>
      </button>

      <button
        :class="['btn', activeTab === 'riwayat' ? 'btn-primary' : 'btn-secondary']"
        style="padding: 8px 16px; font-size: 13px; font-weight: 700; border: none"
        @click="activeTab = 'riwayat'"
      >
        <i class="ph-bold ph-clock-counter-clockwise"></i>
        Riwayat Transaksi ({{ transactions.length }})
      </button>

      <button
        :class="['btn', activeTab === 'master' ? 'btn-primary' : 'btn-secondary']"
        style="padding: 8px 16px; font-size: 13px; font-weight: 700; border: none"
        @click="activeTab = 'master'"
      >
        <i class="ph-bold ph-wrench"></i>
        Master Jasa Servis
      </button>
    </div>

    <!-- TAB 1: KASIR & ANTREAN PKB SIAP BAYAR -->
    <div v-if="activeTab === 'kasir'" class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background: #ffffff;
        "
      >
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin: 0">
            Antrean Pembayaran Kasir
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px; margin-bottom: 0">
            Daftar motor yang telah lulus Quality Control (QC) dan siap diproses pembayarannya
          </p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <button
            class="btn btn-secondary"
            style="padding: 6px 12px; font-size: 12px"
            @click="fetchUnpaidServices"
          >
            <i class="ph-bold ph-arrows-clockwise"></i> Refresh Antrean
          </button>
        </div>
      </div>

      <div class="table-container" style="border: none; border-radius: 0">
        <table class="custom-table">
          <thead>
            <tr>
              <th>No. PKB</th>
              <th>No. Polisi / Kendaraan</th>
              <th>Pelanggan</th>
              <th>Mekanik</th>
              <th style="text-align: right">Biaya Jasa</th>
              <th style="text-align: right">Suku Cadang</th>
              <th style="text-align: right">Total Tagihan</th>
              <th style="text-align: center">Aksi Kasir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="svc in unpaidServices" :key="svc.id">
              <td>
                <span class="pkb-font" style="font-weight: 700; color: var(--primary-color)">
                  {{ svc.nomorPkb || 'PKB-' + svc.id }}
                </span>
              </td>
              <td>
                <span class="nopol-font" style="font-weight: 700; color: var(--text-main)">
                  {{ svc.nopol }}
                </span>
                <div style="font-size: 11px; color: var(--text-muted)">
                  {{ svc.motorType || '-' }}
                </div>
              </td>
              <td>
                <strong style="color: var(--text-main)">{{ svc.customerName }}</strong>
                <div style="font-size: 11px; color: var(--text-secondary)">{{ svc.phone || '-' }}</div>
              </td>
              <td>
                <span style="font-size: 13px; color: var(--text-secondary)">
                  {{ svc.mechanicName || 'Teknisi Umum' }}
                </span>
              </td>
              <td class="numeric" style="text-align: right; color: var(--text-secondary)">
                Rp {{ formatCurrency(svc.totalJasa) }}
              </td>
              <td class="numeric" style="text-align: right; color: var(--text-secondary)">
                Rp {{ formatCurrency(svc.totalSparepart) }}
                <div v-if="svc.itemsCount > 0" style="font-size: 10px; color: var(--text-muted)">
                  ({{ svc.itemsCount }} part/jasa)
                </div>
              </td>
              <td class="numeric" style="text-align: right; font-weight: 800; color: #059669; font-size: 14px">
                Rp {{ formatCurrency(svc.grandTotal) }}
              </td>
              <td style="text-align: center">
                <button
                  v-if="authStore.isAdmin || authStore.isKepalaBengkel"
                  class="btn btn-primary"
                  style="
                    padding: 6px 14px;
                    font-size: 12px;
                    background: #059669;
                    border-color: #059669;
                    font-weight: 700;
                  "
                  @click="$emit('open-payment-modal', svc)"
                >
                  <i class="ph-bold ph-credit-card"></i> Proses Bayar
                </button>
                <span v-else style="font-size: 11px; color: var(--text-muted)">
                  Menunggu Kasir
                </span>
              </td>
            </tr>

            <tr v-if="unpaidServices.length === 0">
              <td colspan="8">
                <div class="empty-state" style="padding: 40px 20px">
                  <div class="empty-state-illust">🎉</div>
                  <div class="empty-state-title">Semua Tagihan Sudah Lunas</div>
                  <div class="empty-state-desc">
                    Tidak ada antrean motor yang menunggu pembayaran di kasir saat ini.
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: RIWAYAT TRANSAKSI & INVOICE LUNAS -->
    <div v-if="activeTab === 'riwayat'" class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px">
      <!-- Search & Filters -->
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 12px;
        "
      >
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin: 0">
            Riwayat Transaksi Kasir
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px; margin-bottom: 0">
            Total Omset Terkumpul: <strong style="color: #059669">Rp {{ formatCurrency(totalRevenue) }}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
          <div style="position: relative; width: 220px">
            <input
              :value="searchQuery"
              type="text"
              class="form-input"
              style="padding-left: 32px; font-size: 13px"
              placeholder="Cari invoice, nopol, nama..."
              @input="$emit('update:searchQuery', $event.target.value); fetchTransactions()"
            />
            <i
              class="ph-bold ph-magnifying-glass"
              style="
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-muted);
              "
            ></i>
          </div>

          <select
            :value="paymentMethodFilter"
            class="form-input"
            style="width: 170px; font-size: 13px"
            @change="$emit('update:paymentMethodFilter', $event.target.value); fetchTransactions()"
          >
            <option value="">Semua Metode</option>
            <option value="Tunai">Tunai</option>
            <option value="Transfer Bank BCA">Transfer BCA</option>
            <option value="Transfer Bank Mandiri">Transfer Mandiri</option>
            <option value="Transfer Bank BRI">Transfer BRI</option>
            <option value="QRIS">QRIS</option>
            <option value="Piutang Armada">Piutang Armada</option>
          </select>
        </div>
      </div>

      <div class="table-container" style="border: none; border-radius: 0">
        <table class="custom-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>No. Polisi / Motor</th>
              <th>Pelanggan</th>
              <th>Metode Bayar</th>
              <th style="text-align: right">Total Tagihan</th>
              <th>Waktu Transaksi</th>
              <th>Kasir</th>
              <th style="text-align: center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trx in filteredTransactions" :key="trx.id">
              <td>
                <span
                  class="pkb-font"
                  style="font-weight: 800; font-size: 13px; color: var(--primary-color)"
                >
                  {{ trx.noInvoice || trx.nomorInvoice || 'INV-' + trx.id }}
                </span>
              </td>
              <td>
                <span class="nopol-font" style="font-weight: 700; color: var(--text-main)">
                  {{ trx.nopol }}
                </span>
                <div style="font-size: 11px; color: var(--text-muted)">
                  {{ trx.service?.motorType || '-' }}
                </div>
              </td>
              <td>
                <div style="font-weight: 600; color: var(--text-main)">{{ trx.customerName }}</div>
                <div style="font-size: 11px; color: var(--text-muted)">{{ trx.phone || '-' }}</div>
              </td>
              <td>
                <span
                  class="badge"
                  style="
                    background: #f0fdf4;
                    color: #166534;
                    font-weight: 700;
                    border: 1px solid #bbf7d0;
                  "
                >
                  {{ trx.metodeBayar }}
                </span>
              </td>
              <td class="numeric" style="text-align: right; font-weight: 800; color: var(--text-main)">
                Rp {{ formatCurrency(trx.total) }}
              </td>
              <td style="font-size: 12px; color: var(--text-secondary)">
                {{ formatDate(trx.tglBayar || trx.createdAt) }}
              </td>
              <td style="font-size: 12px; color: var(--text-secondary)">
                {{ trx.kasir?.nama || trx.kasir?.username || 'Kasir' }}
              </td>
              <td style="text-align: center">
                <button
                  class="btn btn-secondary"
                  style="padding: 5px 10px; font-size: 12px"
                  @click="$emit('view-receipt', trx)"
                >
                  <i class="ph-bold ph-printer"></i> Cetak Struk
                </button>
              </td>
            </tr>

            <tr v-if="filteredTransactions.length === 0">
              <td colspan="8">
                <div class="empty-state" style="padding: 40px 20px">
                  <div class="empty-state-illust">🧾</div>
                  <div class="empty-state-title">Tidak ada data transaksi</div>
                  <div class="empty-state-desc">
                    Riwayat pembayaran invoice kasir akan muncul di sini.
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: MASTER JASA SERVIS & TARIF -->
    <div v-if="activeTab === 'master'" class="card" style="padding: 0; overflow: hidden">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
        "
      >
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin: 0">
            Master Jasa Servis & Tarif
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px; margin-bottom: 0">
            Katalog paket jasa servis bengkel yang digunakan saat penerimaan PKB dan invoice kasir
          </p>
        </div>
        <button
          v-if="authStore.isAdmin"
          class="btn btn-primary"
          @click="$emit('open-service-master-modal')"
        >
          <i class="ph-bold ph-plus"></i> Tambah Jasa Servis
        </button>
      </div>

      <div class="table-container" style="border: none; border-radius: 0">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Nama Jasa Servis</th>
              <th style="text-align: right">Tarif / Harga</th>
              <th>Deskripsi Singkat</th>
              <th style="text-align: center">Status</th>
              <th v-if="authStore.isAdmin" style="text-align: right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in serviceMasters" :key="service.id">
              <td>
                <strong style="color: var(--text-main)">{{ service.nama }}</strong>
              </td>
              <td
                class="numeric"
                style="text-align: right; font-weight: 700; color: var(--primary-color)"
              >
                Rp {{ formatCurrency(service.harga) }}
              </td>
              <td style="color: var(--text-secondary)">{{ service.deskripsi || '-' }}</td>
              <td style="text-align: center">
                <span :class="['badge', service.is_active ? 'badge-done' : 'badge-error']">
                  {{ service.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td v-if="authStore.isAdmin" style="text-align: right">
                <button
                  class="btn btn-secondary"
                  style="padding: 5px 10px; font-size: 12px; margin-right: 6px"
                  @click="$emit('edit-service-master', service)"
                >
                  <i class="ph-bold ph-pencil-simple"></i> Edit
                </button>
                <button
                  class="btn btn-danger"
                  style="padding: 5px 10px; font-size: 12px"
                  @click="$emit('delete-service-master', service)"
                >
                  <i class="ph-bold ph-trash"></i> Hapus
                </button>
              </td>
            </tr>
            <tr v-if="serviceMasters.length === 0">
              <td :colspan="authStore.isAdmin ? 5 : 4">
                <div class="empty-state">
                  <div class="empty-state-illust">🧰</div>
                  <div class="empty-state-title">Katalog jasa servis masih kosong</div>
                  <div class="empty-state-desc">
                    Belum ada paket jasa servis yang terdaftar.
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const authStore = useAuthStore();
const activeTab = ref('kasir');

defineProps({
  serviceMasters: { type: Array, required: true },
  transactions: { type: Array, required: true },
  unpaidServices: { type: Array, default: () => [] },
  unpaidCount: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  filteredTransactions: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  paymentMethodFilter: { type: String, default: '' },
  fetchTransactions: { type: Function, default: () => {} },
  fetchUnpaidServices: { type: Function, default: () => {} },
});

defineEmits([
  'open-service-master-modal',
  'edit-service-master',
  'delete-service-master',
  'open-payment-modal',
  'view-receipt',
]);
</script>
