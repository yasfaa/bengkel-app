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
            Katalog paket jasa servis bengkel yang digunakan saat pembuatan invoice
          </p>
        </div>
        <button class="btn btn-primary" @click="$emit('open-service-master-modal')">
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
              <th style="text-align: right">Aksi</th>
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
              <td style="text-align: right">
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
              <td colspan="5">
                <div class="empty-state">
                  <div class="empty-state-illust">🧰</div>
                  <div class="empty-state-title">Katalog jasa servis masih kosong</div>
                  <div class="empty-state-desc">
                    Tambahkan paket jasa servis agar dapat dipilih pada tagihan kasir.
                  </div>
                  <button class="btn btn-primary" @click="$emit('open-service-master-modal')">
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
              <th>Waktu Bayar</th>
              <th>Kendaraan</th>
              <th>Rincian Layanan</th>
              <th style="text-align: right">Total Bayar</th>
              <th>Metode</th>
              <th style="text-align: center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td>
                <span class="sku-code" style="font-weight: 700; color: var(--primary-color)">
                  {{ transaction.invoiceNo }}
                </span>
              </td>
              <td class="numeric" style="color: var(--text-secondary); font-size: 13px">
                {{ transaction.date }}
              </td>
              <td>
                <div class="nopol-font" style="font-weight: 700">{{ transaction.nopol }}</div>
                <div style="font-size: 12px; color: var(--text-muted)">{{ transaction.motor }}</div>
              </td>
              <td style="color: var(--text-secondary)">{{ transaction.servicesText }}</td>
              <td
                class="numeric"
                style="text-align: right; font-weight: 800; color: #059669; font-size: 14px"
              >
                Rp {{ formatCurrency(transaction.total) }}
              </td>
              <td>
                <span class="badge badge-working">{{ transaction.paymentMethod }}</span>
              </td>
              <td style="text-align: center">
                <span class="badge badge-done"> <i class="ph-bold ph-check"></i> Lunas </span>
              </td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-state-illust">🧾</div>
                  <div class="empty-state-title">Belum ada riwayat transaksi</div>
                  <div class="empty-state-desc">
                    Belum ada pembayaran kasir yang diselesaikan hari ini.
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
defineProps({
  transactions: { type: Array, required: true },
  serviceMasters: { type: Array, required: true },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['open-service-master-modal', 'edit-service-master', 'delete-service-master']);
</script>
