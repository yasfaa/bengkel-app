<template>
  <div>
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-weight: 700;">Manajemen Sparepart</h3>
        <p style="color: var(--text-muted);">Katalog barang dan pencatatan stok masuk</p>
      </div>
      <button class="btn btn-accent" @click="$emit('open-stock-modal')">
        <i class="ph-bold ph-plus"></i> Tambah Stok Masuk
      </button>
    </div>

    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Nama Sparepart</th>
            <th>Stok Tersedia</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Supplier</th>
            <th>Status Stok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="part in spareparts" :key="part.id">
            <td><strong>{{ part.name }}</strong></td>
            <td>{{ part.stok }} unit</td>
            <td>Rp {{ formatCurrency(part.hargaBeli) }}</td>
            <td>Rp {{ formatCurrency(part.hargaJual) }}</td>
            <td>{{ part.supplier }}</td>
            <td>
              <span :class="['badge', part.stok <= 5 ? 'badge-error' : 'badge-done']">
                {{ part.stok <= 5 ? 'Menipis' : 'Cukup' }}
              </span>
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