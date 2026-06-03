<template>
  <div v-if="modelValue" class="modal-backdrop">
    <div class="modal-card" style="max-width: 500px;">
      <div class="modal-header">
        <h3>Buat Invoice & Pembayaran</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div class="modal-body" v-if="selectedService">
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">No Polisi:</span>
            <strong style="color: var(--text-main);">{{ selectedService.nopol }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px;">
            <span style="color: var(--text-muted);">Pelanggan:</span>
            <strong>{{ selectedService.customerName }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px;">
            <span style="color: var(--text-muted);">Keluhan:</span>
            <span>{{ selectedService.keluhan }}</span>
          </div>
        </div>

        <h4 style="font-weight: 700; margin-bottom: 12px;">Sparepart & Jasa Tambahan</h4>
        <div class="form-group">
          <label class="form-label">Pilih Jasa Servis</label>
          <select v-model="invoiceForm.jasaPrice" class="form-input" style="height: auto;">
            <option :value="50000">Servis Ringan - Rp 50.000</option>
            <option :value="100000">Servis Lengkap - Rp 100.000</option>
            <option :value="150000">Turun Mesin Ringan - Rp 150.000</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ganti Sparepart (Optional)</label>
          <select v-model="invoiceForm.sparepartId" class="form-input" style="height: auto;">
            <option value="">-- Tidak Ada Ganti Sparepart --</option>
            <option v-for="part in spareparts" :key="part.id" :value="part.id" :disabled="part.stok <= 0">
              {{ part.name }} (Stok: {{ part.stok }} | Rp {{ formatCurrency(part.hargaJual) }})
            </option>
          </select>
        </div>

        <div style="background-color: var(--bg-app); padding: 16px; border-radius: 12px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px;">
            <span>Jasa Servis:</span>
            <span>Rp {{ formatCurrency(invoiceForm.jasaPrice) }}</span>
          </div>
          <div v-if="selectedSparepart" style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px;">
            <span>Sparepart ({{ selectedSparepart.name }}):</span>
            <span>Rp {{ formatCurrency(selectedSparepart.hargaJual) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 8px; color: var(--primary-color);">
            <span>Total Tagihan:</span>
            <span>Rp {{ formatCurrency(calculatedTotalInvoice) }}</span>
          </div>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Metode Pembayaran</label>
          <select v-model="invoiceForm.paymentMethod" class="form-input" style="height: auto;">
            <option value="Tunai">Tunai</option>
            <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
            <option value="Transfer BCA">Transfer Bank BCA</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-accent" @click="$emit('submit')">Proses Bayar (Lunas)</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  selectedService: { type: Object, default: null },
  invoiceForm: { type: Object, required: true },
  spareparts: { type: Array, required: true },
  selectedSparepart: { type: Object, default: null },
  calculatedTotalInvoice: { type: Number, required: true },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['update:modelValue', 'submit']);
</script>