<template>
  <div class="card" style="padding: 0; overflow: hidden; height: 100%">
    <div class="recap-header">
      <div style="display: flex; align-items: center; gap: 8px">
        <i class="ph-bold ph-chart-line-up" style="color: #7c3aed; font-size: 20px"></i>
        <div>
          <h4 style="font-size: 14.5px; font-weight: 800; color: var(--text-main)">
            Rekap Keuangan & Metode Pembayaran
          </h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 1px">
            Ringkasan omzet kasir dan distribusi metode pembayaran hari ini
          </p>
        </div>
      </div>
    </div>

    <div style="padding: 16px 20px">
      <!-- Metric Highlights -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px">
        <div class="recap-stat-box" style="background: #fdf4ff; border-color: #f5d0fe">
          <div style="font-size: 11.5px; color: #86198f; font-weight: 700">
            Rata-rata Tagihan (AOV)
          </div>
          <div
            class="numeric"
            style="font-size: 17px; font-weight: 800; color: #701a75; margin-top: 4px"
          >
            Rp {{ formatCurrency(averageTicketSize) }}
          </div>
          <div style="font-size: 11px; color: #a21caf; margin-top: 2px">Per unit sepeda motor</div>
        </div>

        <div class="recap-stat-box" style="background: #f0fdf4; border-color: #bbf7d0">
          <div style="font-size: 11.5px; color: #166534; font-weight: 700">
            Total Transaksi Lunas
          </div>
          <div
            class="numeric"
            style="font-size: 17px; font-weight: 800; color: #14532d; margin-top: 4px"
          >
            {{ transactions.length }} Transaksi
          </div>
          <div style="font-size: 11px; color: #15803d; margin-top: 2px">
            Kasir beroperasi normal
          </div>
        </div>
      </div>

      <!-- Payment Breakdown Table -->
      <div style="font-size: 12.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px">
        Rincian Berdasarkan Metode Pembayaran:
      </div>
      <div
        class="table-container"
        style="border: 1px solid var(--border-subtle); border-radius: 8px; margin-bottom: 14px"
      >
        <table class="custom-table" style="font-size: 12.5px">
          <thead>
            <tr>
              <th>Metode</th>
              <th style="text-align: center">Frekuensi</th>
              <th style="text-align: right">Total Omzet</th>
              <th style="text-align: right">Porsi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paymentMethodBreakdown" :key="item.method">
              <td>
                <span
                  class="badge"
                  style="background: #f1f5f9; color: var(--text-main); font-weight: 700"
                >
                  {{ item.method }}
                </span>
              </td>
              <td style="text-align: center; font-weight: 600">{{ item.count }}x</td>
              <td
                class="numeric"
                style="text-align: right; font-weight: 700; color: var(--text-main)"
              >
                Rp {{ formatCurrency(item.total) }}
              </td>
              <td class="numeric" style="text-align: right; color: var(--text-muted)">
                {{ item.percentage }}%
              </td>
            </tr>
            <tr v-if="paymentMethodBreakdown.length === 0">
              <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 16px">
                Belum ada data transaksi tercatat hari ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '../../utils/formatters';

const props = defineProps({
  transactions: { type: Array, required: true },
  totalRevenue: { type: Number, required: true },
});

const averageTicketSize = computed(() => {
  if (props.transactions.length === 0) return 0;
  return Math.round(props.totalRevenue / props.transactions.length);
});

const paymentMethodBreakdown = computed(() => {
  if (props.transactions.length === 0) return [];
  const map = {};

  props.transactions.forEach((trx) => {
    const method = (trx.metodePembayaran || 'TUNAI').toUpperCase();
    if (!map[method]) {
      map[method] = { method, count: 0, total: 0 };
    }
    map[method].count += 1;
    map[method].total += Number(trx.totalBayar) || 0;
  });

  const totalAll = props.totalRevenue || 1;
  return Object.values(map).map((item) => ({
    ...item,
    percentage: ((item.total / totalAll) * 100).toFixed(1),
  }));
});
</script>

<style scoped>
.recap-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.recap-stat-box {
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 8px;
}
</style>
