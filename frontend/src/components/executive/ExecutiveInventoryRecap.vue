<template>
  <div class="card" style="padding: 0; overflow: hidden; height: 100%">
    <div class="recap-header">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="ph-bold ph-package" style="color: #ea580c; font-size: 20px"></i>
          <div>
            <h4 style="font-size: 14.5px; font-weight: 800; color: var(--text-main)">
              Rekap Persediaan & Peringatan Stok Kritis (ROP)
            </h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 1px">
              Monitoring suku cadang yang berada di bawah batas minimum pemesanan kembali
            </p>
          </div>
        </div>
        <span class="badge badge-error" v-if="criticalSpareparts.length > 0">
          {{ criticalSpareparts.length }} Item Kritis
        </span>
      </div>
    </div>

    <div style="padding: 16px 20px">
      <!-- Valuation Summary -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px">
        <div class="recap-stat-box" style="background: #fff7ed; border-color: #ffedd5">
          <div style="font-size: 11.5px; color: #9a3412; font-weight: 700">Total Nilai Aset Stok (HPP)</div>
          <div class="numeric" style="font-size: 17px; font-weight: 800; color: #7c2d12; margin-top: 4px">
            Rp {{ formatCurrency(totalInventoryAssetValue) }}
          </div>
          <div style="font-size: 11px; color: #c2410c; margin-top: 2px">Berdasarkan harga beli gudang</div>
        </div>

        <div class="recap-stat-box" style="background: #eff6ff; border-color: #dbeafe">
          <div style="font-size: 11.5px; color: #1e40af; font-weight: 700">Total Potensi Nilai Jual</div>
          <div class="numeric" style="font-size: 17px; font-weight: 800; color: #1e3a8a; margin-top: 4px">
            Rp {{ formatCurrency(totalInventorySalesValue) }}
          </div>
          <div style="font-size: 11px; color: #2563eb; margin-top: 2px">Estimasi margin kotor: Rp {{ formatCurrency(totalInventorySalesValue - totalInventoryAssetValue) }}</div>
        </div>
      </div>

      <!-- Critical Items List -->
      <div style="font-size: 12.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px">
        Daftar Suku Cadang Perlu Restock:
      </div>
      <div class="table-container" style="border: 1px solid var(--border-subtle); border-radius: 8px">
        <table class="custom-table" style="font-size: 12.5px">
          <thead>
            <tr>
              <th>Kode & Nama Part</th>
              <th>Kategori</th>
              <th>Distributor</th>
              <th style="text-align: center">Sisa Stok</th>
              <th style="text-align: center">Batas ROP</th>
              <th style="text-align: center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in criticalSpareparts" :key="part.id">
              <td>
                <div style="font-weight: 700; color: var(--text-main)">{{ part.nama }}</div>
                <div class="sku-code" style="font-size: 11px; color: var(--primary-color)">{{ part.kode_part }}</div>
              </td>
              <td>
                <span class="badge" style="background: #f1f5f9; color: var(--text-secondary); font-size: 10.5px">
                  {{ part.kategori || 'FAST_MOVING' }}
                </span>
              </td>
              <td style="color: var(--text-secondary)">{{ part.supplier || '-' }}</td>
              <td class="numeric" style="text-align: center; font-weight: 800; color: #dc2626">
                {{ part.stok }} unit
              </td>
              <td class="numeric" style="text-align: center; color: var(--text-muted)">
                {{ part.min_stok || 5 }} unit
              </td>
              <td style="text-align: center">
                <span v-if="part.stok <= 0" class="badge badge-error" style="font-size: 10.5px">
                  Habis (0)
                </span>
                <span v-else class="badge badge-pending" style="font-size: 10.5px">
                  Menipis
                </span>
              </td>
            </tr>
            <tr v-if="criticalSpareparts.length === 0">
              <td colspan="6" style="text-align: center; color: #059669; padding: 18px">
                <i class="ph-bold ph-check-circle" style="font-size: 20px; vertical-align: middle; margin-right: 4px"></i>
                Semua suku cadang berada dalam jumlah persediaan yang aman.
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
  spareparts: { type: Array, required: true },
});

const criticalSpareparts = computed(() => {
  return props.spareparts.filter((part) => {
    const minStok = part.min_stok || 5;
    return part.stok <= minStok;
  });
});

const totalInventoryAssetValue = computed(() => {
  return props.spareparts.reduce((acc, part) => {
    const hpp = Number(part.harga_beli || part.hargaBeli) || 0;
    const stok = Number(part.stok) || 0;
    return acc + hpp * stok;
  }, 0);
});

const totalInventorySalesValue = computed(() => {
  return props.spareparts.reduce((acc, part) => {
    const hargaJual = Number(part.harga_jual || part.hargaJual) || 0;
    const stok = Number(part.stok) || 0;
    return acc + hargaJual * stok;
  }, 0);
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
