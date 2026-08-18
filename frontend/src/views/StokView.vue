<template>
  <div>
    <!-- Section Header -->
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">Manajemen Stok Sparepart</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Katalog barang, harga pokok & jual, serta pencatatan stok masuk</p>
      </div>
      <button class="btn btn-primary" @click="$emit('open-stock-modal')">
        <i class="ph-bold ph-plus"></i> Catat Stok Masuk
      </button>
    </div>

    <!-- Inventory Data Table -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Nama Sparepart / SKU</th>
            <th style="text-align: right;">Stok Tersedia</th>
            <th style="text-align: right;">Harga Beli (HPP)</th>
            <th style="text-align: right;">Harga Jual</th>
            <th>Supplier</th>
            <th style="text-align: center;">Status Stok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="part in spareparts" :key="part.id">
            <td>
              <strong style="color: var(--text-main);">{{ part.name }}</strong>
            </td>
            <td class="numeric" style="text-align: right; font-weight: 700; font-size: 14px;">
              {{ part.stok }} <span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">unit</span>
            </td>
            <td class="numeric" style="text-align: right; color: var(--text-secondary);">
              Rp {{ formatCurrency(part.hargaBeli) }}
            </td>
            <td class="numeric" style="text-align: right; font-weight: 700; color: #059669;">
              Rp {{ formatCurrency(part.hargaJual) }}
            </td>
            <td style="color: var(--text-secondary);">{{ part.supplier }}</td>
            <td style="text-align: center;">
              <span :class="['badge', part.stok <= 5 ? 'badge-error' : 'badge-done']">
                <i :class="['ph-bold', part.stok <= 5 ? 'ph-warning' : 'ph-check-circle']"></i>
                {{ part.stok <= 5 ? 'Menipis' : 'Cukup' }}
              </span>
            </td>
          </tr>
          <tr v-if="spareparts.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-illust">📦</div>
                <div class="empty-state-title">Katalog sparepart kosong</div>
                <div class="empty-state-desc">Belum ada data barang sparepart yang tercatat.</div>
                <button class="btn btn-primary" @click="$emit('open-stock-modal')">
                  <i class="ph-bold ph-plus"></i> Catat Stok Masuk
                </button>
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
  spareparts: { type: Array, required: true },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['open-stock-modal']);
</script>