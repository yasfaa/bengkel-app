<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 520px">
      <div class="modal-header">
        <h3>Buat Invoice & Pembayaran Kasir</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>
      <div v-if="selectedService" class="modal-body">
        <!-- Order Detail Brief -->
        <div
          style="
            background: #f8fafc;
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 18px;
          "
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
            "
          >
            <span
              style="
                font-size: 12px;
                font-weight: 600;
                color: var(--text-muted);
                text-transform: uppercase;
              "
              >No. Polisi:</span
            >
            <strong class="nopol-font" style="color: var(--primary-color); font-size: 14px">{{
              selectedService.nopol
            }}</strong>
          </div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
            "
          >
            <span
              style="
                font-size: 12px;
                font-weight: 600;
                color: var(--text-muted);
                text-transform: uppercase;
              "
              >Pelanggan:</span
            >
            <strong style="color: var(--text-main)">{{ selectedService.customerName }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span
              style="
                font-size: 12px;
                font-weight: 600;
                color: var(--text-muted);
                text-transform: uppercase;
              "
              >Keluhan Awal:</span
            >
            <span style="color: var(--text-secondary)">{{ selectedService.keluhan }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Pilih Paket Jasa Servis</label>
          <select v-model="invoiceForm.serviceMasterId" class="form-input">
            <option value="">-- Pilih Jasa Servis --</option>
            <option
              v-for="service in serviceMasters"
              :key="service.id"
              :value="service.id"
              :disabled="!service.is_active"
            >
              {{ service.nama }} - Rp {{ formatCurrency(service.harga) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ganti Sparepart (Opsional)</label>
          <select v-model="invoiceForm.sparepartId" class="form-input">
            <option value="">-- Tidak Ada Ganti Sparepart --</option>
            <option
              v-for="part in spareparts"
              :key="part.id"
              :value="part.id"
              :disabled="part.stok <= 0"
            >
              {{ part.name }} (Stok: {{ part.stok }} | Rp {{ formatCurrency(part.hargaJual) }})
            </option>
          </select>
        </div>

        <!-- Rincian Tagihan Card -->
        <div
          style="
            background: #f8fafc;
            border: 1px solid var(--border-subtle);
            padding: 16px;
            border-radius: 10px;
            margin-top: 18px;
          "
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: var(--text-secondary);
              margin-bottom: 8px;
            "
          >
            <span>Biaya Jasa Servis:</span>
            <span class="numeric" style="font-weight: 600"
              >Rp {{ formatCurrency(selectedServiceMaster?.harga || 0) }}</span
            >
          </div>
          <div
            v-if="selectedSparepart"
            style="
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: var(--text-secondary);
              margin-bottom: 8px;
            "
          >
            <span>Sparepart ({{ selectedSparepart.name }}):</span>
            <span class="numeric" style="font-weight: 600"
              >Rp {{ formatCurrency(selectedSparepart.hargaJual) }}</span
            >
          </div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: 800;
              border-top: 1px solid var(--border-subtle);
              padding-top: 10px;
              margin-top: 10px;
              color: var(--text-main);
            "
          >
            <span>Total Tagihan:</span>
            <span class="numeric" style="color: #059669"
              >Rp {{ formatCurrency(calculatedTotalInvoice) }}</span
            >
          </div>
        </div>

        <div class="form-group" style="margin-top: 18px; margin-bottom: 0">
          <label class="form-label">Metode Pembayaran</label>
          <select v-model="invoiceForm.paymentMethod" class="form-input">
            <option value="Tunai">Tunai / Cash</option>
            <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
            <option value="Transfer BCA">Transfer Bank BCA</option>
            <option value="QRIS">QRIS / E-Wallet</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button class="btn btn-primary" style="background-color: #059669" @click="$emit('submit')">
          <i class="ph-bold ph-check"></i> Proses Bayar & Lunas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  selectedService: { type: Object, default: null },
  invoiceForm: { type: Object, required: true },
  serviceMasters: { type: Array, required: true },
  spareparts: { type: Array, required: true },
  selectedSparepart: { type: Object, default: null },
  selectedServiceMaster: { type: Object, default: null },
  calculatedTotalInvoice: { type: Number, required: true },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['update:modelValue', 'submit']);
</script>
