<template>
  <div>
    <!-- Master Jasa Servis Section -->
    <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden">
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
          <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main)">
            Master Jasa Servis & Tarif
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
            {{
              authStore.isAdmin
                ? 'Katalog paket jasa servis bengkel yang digunakan saat penerimaan PKB dan invoice kasir'
                : 'Katalog paket jasa servis resmi dan daftar tarif standar bengkel'
            }}
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
                    {{
                      authStore.isAdmin
                        ? 'Tambahkan paket jasa servis agar dapat dipilih pada tagihan kasir.'
                        : 'Belum ada paket jasa servis yang terdaftar.'
                    }}
                  </div>
                  <button
                    v-if="authStore.isAdmin"
                    class="btn btn-primary"
                    @click="$emit('open-service-master-modal')"
                  >
                    <i class="ph-bold ph-plus"></i> Tambah Jasa Servis
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Riwayat Transaksi Invoice -->
    <div class="card" style="padding: 0; overflow: hidden">
      <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-subtle)">
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main)">
          Riwayat Transaksi & Pembayaran
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
          Daftar invoice dan pembayaran kasir yang tercatat di sistem
        </p>
      </div>

      <div class="table-container" style="border: none; border-radius: 0">
        <table class="custom-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>No. Polisi / Unit</th>
              <th>Pelanggan</th>
              <th>Metode</th>
              <th style="text-align: right">Total Bayar</th>
              <th>Waktu Transaksi</th>
              <th style="text-align: center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trx in transactions" :key="trx.id">
              <td>
                <span
                  class="pkb-font"
                  style="font-weight: 800; font-size: 13px; color: var(--primary-color)"
                >
                  {{ trx.nomorInvoice || 'INV-' + trx.id }}
                </span>
              </td>
              <td>
                <span class="nopol-font" style="font-weight: 700; color: var(--text-main)">
                  {{ trx.nopol }}
                </span>
              </td>
              <td>
                <div style="font-weight: 600; color: var(--text-main)">{{ trx.customerName }}</div>
              </td>
              <td>
                <span class="badge" style="background: #f1f5f9; color: var(--text-secondary)">
                  {{ trx.metodePembayaran || 'TUNAI' }}
                </span>
              </td>
              <td
                class="numeric"
                style="text-align: right; font-weight: 800; color: var(--text-main)"
              >
                Rp {{ formatCurrency(trx.totalBayar) }}
              </td>
              <td style="font-size: 12px; color: var(--text-secondary)">
                {{ formatDate(trx.createdAt) }}
              </td>
              <td style="text-align: center">
                <span class="badge badge-done">
                  <i class="ph-bold ph-check"></i>
                  {{ trx.status || 'LUNAS' }}
                </span>
              </td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-illust">🧾</div>
                  <div class="empty-state-title">Belum ada riwayat transaksi</div>
                  <div class="empty-state-desc">
                    Transaksi pembayaran dari kasir akan tercatat di sini secara otomatis.
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
import { useAuthStore } from '../stores/authStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const authStore = useAuthStore();

defineProps({
  serviceMasters: { type: Array, required: true },
  transactions: { type: Array, required: true },
});

defineEmits([
  'open-service-master-modal',
  'edit-service-master',
  'delete-service-master',
]);
</script>
