<template>
  <div>
    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-weight: 700; margin-bottom: 8px;">Invoice & Pembayaran</h3>
      <p style="color: var(--text-muted);">Riwayat transaksi pembayaran jasa & sparepart</p>
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
  formatCurrency: { type: Function, required: true },
});
</script>