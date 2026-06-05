<template>
  <div>
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-weight: 700; margin-bottom: 8px;">Invoice & Pembayaran</h3>
      <p style="color: var(--text-muted);">Riwayat transaksi pembayaran jasa & sparepart</p>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 style="font-weight: 700; margin-bottom: 4px;">Master Jasa Servis</h3>
          <p style="color: var(--text-muted);">Kelola daftar jasa yang muncul di invoice.</p>
        </div>
        <button class="btn btn-accent" @click="$emit('open-service-master-modal')">
          <i class="ph-bold ph-plus"></i> Tambah Jasa
        </button>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Nama Jasa</th>
              <th>Harga</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in serviceMasters" :key="service.id">
              <td><strong>{{ service.nama }}</strong></td>
              <td>Rp {{ formatCurrency(service.harga) }}</td>
              <td>{{ service.deskripsi || '-' }}</td>
              <td>
                <span :class="['badge', service.is_active ? 'badge-done' : 'badge-error']">
                  {{ service.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px; margin-right: 8px;" @click="$emit('edit-service-master', service)">
                  Edit
                </button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" @click="$emit('delete-service-master', service)">
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="serviceMasters.length === 0">
              <td colspan="5">
                <div class="empty-state">
                  <div class="empty-state-illust" style="color: var(--secondary-color);">🧰</div>
                  <div class="empty-state-title">Belum ada master jasa servis</div>
                  <div class="empty-state-desc">Tambahkan jasa servis agar muncul di pilihan invoice.</div>
                  <button class="btn btn-accent" @click="$emit('open-service-master-modal')">
                    <i class="ph-bold ph-plus"></i> Tambah Jasa Servis
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>No Invoice</th>
            <th>Tanggal</th>
            <th>Kendaraan</th>
            <th>Layanan</th>
            <th>Total Pembayaran</th>
            <th>Metode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td><strong style="color: var(--primary-color);">{{ transaction.invoiceNo }}</strong></td>
            <td>{{ transaction.date }}</td>
            <td>{{ transaction.nopol }} - {{ transaction.motor }}</td>
            <td>{{ transaction.servicesText }}</td>
            <td><strong>Rp {{ formatCurrency(transaction.total) }}</strong></td>
            <td>{{ transaction.paymentMethod }}</td>
            <td><span class="badge badge-done">Lunas</span></td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="7">
              <div class="empty-state">
                <div class="empty-state-illust" style="color: var(--secondary-color);">🧾</div>
                <div class="empty-state-title">Belum ada data transaksi</div>
                <div class="empty-state-desc">Belum ada transaksi pembayaran yang dilakukan hari ini.</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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