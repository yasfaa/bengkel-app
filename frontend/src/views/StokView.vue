<template>
  <div>
    <!-- Section Header Card -->
    <div
      class="card"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      "
    >
      <div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main)">
          Master Data Inventaris & Stok Suku Cadang
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
          {{
            authStore.isAdmin
              ? 'Katalog sparepart resmi, monitoring batas minimum stok (ROP), dan pencatatan restock barang masuk'
              : 'Katalog sparepart resmi dan informasi ketersediaan sisa stok fisik di gudang'
          }}
        </p>
      </div>
      <div v-if="authStore.isAdmin" style="display: flex; gap: 10px">
        <button class="btn btn-secondary" @click="$emit('open-sparepart-modal')">
          <i class="ph-bold ph-plus"></i> Tambah Master Part
        </button>
        <button class="btn btn-primary" @click="$emit('open-stock-modal')">
          <i class="ph-bold ph-arrow-down-left"></i> Input Stok Masuk
        </button>
      </div>
    </div>

    <!-- Data Table Spareparts -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Kode Part & Suku Cadang</th>
            <th>Kategori</th>
            <th>Distributor / Supplier</th>
            <th style="text-align: right">Harga Pokok (HPP)</th>
            <th style="text-align: right">Harga Jual</th>
            <th style="text-align: center">Sisa Stok</th>
            <th v-if="authStore.isAdmin" style="text-align: right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="part in spareparts" :key="part.id">
            <td>
              <div
                class="sku-code"
                style="font-weight: 700; font-size: 12px; color: var(--primary-color)"
              >
                {{ part.kode_part || 'PRT-' + part.id }}
              </div>
              <div style="font-weight: 700; color: var(--text-main); margin-top: 2px">
                {{ part.nama || part.name }}
              </div>
            </td>
            <td>
              <span
                class="badge"
                style="
                  background: #f1f5f9;
                  color: var(--text-secondary);
                  border-color: var(--border-subtle);
                "
              >
                {{ part.kategori || 'FAST_MOVING' }}
              </span>
            </td>
            <td>
              <div style="color: var(--text-secondary); font-weight: 500">
                {{ part.supplier || '-' }}
              </div>
            </td>
            <td class="amount numeric" style="text-align: right; color: var(--text-muted)">
              Rp {{ formatCurrency(part.harga_beli || part.hargaBeli) }}
            </td>
            <td
              class="amount numeric"
              style="text-align: right; font-weight: 700; color: var(--text-main)"
            >
              Rp {{ formatCurrency(part.harga_jual || part.hargaJual) }}
            </td>
            <td style="text-align: center">
              <span v-if="part.stok <= 0" class="badge badge-error">
                <i class="ph-bold ph-x-circle"></i> Habis (0 unit)
              </span>
              <span v-else-if="part.stok <= (part.min_stok || 5)" class="badge badge-pending">
                <i class="ph-bold ph-warning"></i> Menipis ({{ part.stok }} unit)
              </span>
              <span v-else class="badge badge-done">
                <i class="ph-bold ph-check"></i> Cukup ({{ part.stok }} unit)
              </span>
            </td>
            <td v-if="authStore.isAdmin" style="text-align: right; white-space: nowrap">
              <button
                class="btn btn-secondary"
                style="padding: 6px 10px; font-size: 12px; margin-right: 6px"
                title="Ubah Sparepart"
                @click="$emit('edit-sparepart', part)"
              >
                <i class="ph-bold ph-pencil"></i>
              </button>
              <button
                class="btn btn-danger"
                style="padding: 6px 10px; font-size: 12px"
                title="Hapus Sparepart"
                @click="$emit('delete-sparepart', part)"
              >
                <i class="ph-bold ph-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="spareparts.length === 0">
            <td :colspan="authStore.isAdmin ? 7 : 6">
              <div class="empty-state">
                <div class="empty-state-illust">📦</div>
                <div class="empty-state-title">Belum ada suku cadang terdaftar</div>
                <div class="empty-state-desc">
                  {{
                    authStore.isAdmin
                      ? 'Tambahkan master suku cadang pertama bengkel Anda.'
                      : 'Katalog suku cadang saat ini masih kosong.'
                  }}
                </div>
                <button
                  v-if="authStore.isAdmin"
                  class="btn btn-primary"
                  @click="$emit('open-sparepart-modal')"
                >
                  <i class="ph-bold ph-plus"></i> Tambah Master Part
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
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

defineProps({
  spareparts: { type: Array, required: true },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['open-stock-modal', 'open-sparepart-modal', 'edit-sparepart', 'delete-sparepart']);
</script>
