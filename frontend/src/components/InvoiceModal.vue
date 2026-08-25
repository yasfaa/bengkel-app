<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card" style="max-width: 580px">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px">
          <div
            style="
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: #ecfdf5;
              color: #059669;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            "
          >
            <i class="ph-bold ph-receipt"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700">Kasir & Pembayaran PKB</h3>
            <span style="font-size: 12px; color: var(--text-muted)">
              Pelunasan tagihan pengerjaan bengkel
            </span>
          </div>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
      </div>

      <div v-if="selectedService" class="modal-body" style="padding: 20px">
        <!-- Vehicle & Customer Summary Header -->
        <div
          style="
            background: #f8fafc;
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 16px;
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
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted)"
              >NO. POLISI</span
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
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted)"
              >PELANGGAN / MOTOR</span
            >
            <strong style="font-size: 13px; color: var(--text-main)"
              >{{ selectedService.customerName }} &bull; {{ selectedService.motorType || '-' }}</strong
            >
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted)">MEKANIK</span>
            <span style="font-size: 13px; color: var(--text-secondary)">{{
              selectedService.mechanicName || 'Teknisi Umum'
            }}</span>
          </div>
        </div>

        <!-- Breakdown Item PKB Table / List -->
        <div style="margin-bottom: 16px">
          <label
            class="form-label"
            style="margin-bottom: 8px; display: flex; justify-content: space-between"
          >
            <span>Rincian Jasa & Suku Cadang (PKB)</span>
            <span style="font-size: 11px; color: var(--text-muted)"
              >{{ selectedService.approvedItems?.length || 0 }} Item Tambahan</span
            >
          </label>

          <div
            style="
              background: #ffffff;
              border: 1px solid var(--border-subtle);
              border-radius: 10px;
              max-height: 180px;
              overflow-y: auto;
              font-size: 13px;
            "
          >
            <!-- Base Package -->
            <div
              style="
                display: flex;
                justify-content: space-between;
                padding: 10px 14px;
                border-bottom: 1px dashed var(--border-subtle);
              "
            >
              <div>
                <span
                  style="
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: #e0e7ff;
                    color: #4338ca;
                    font-weight: 700;
                    margin-right: 6px;
                  "
                  >PAKET</span
                >
                <span style="font-weight: 600">{{
                  selectedService.basePackageName || 'Paket Servis Dasar'
                }}</span>
              </div>
              <span class="numeric" style="font-weight: 600"
                >Rp {{ formatCurrency(selectedService.basePackagePrice || 0) }}</span
              >
            </div>

            <!-- Approved Extra Items -->
            <div
              v-for="item in selectedService.approvedItems || []"
              :key="item.id"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 14px;
                border-bottom: 1px solid #f1f5f9;
              "
            >
              <div style="display: flex; align-items: center; gap: 6px">
                <span
                  :style="{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: item.itemType === 'SPAREPART' ? '#dbeafe' : '#fef3c7',
                    color: item.itemType === 'SPAREPART' ? '#1e40af' : '#b45309',
                  }"
                >
                  {{ item.itemType === 'SPAREPART' ? 'PART' : 'JASA' }}
                </span>
                <span>{{ item.namaItem }}</span>
                <span style="color: var(--text-muted); font-size: 11px">x{{ item.quantity }}</span>
              </div>
              <span class="numeric" style="color: var(--text-secondary)"
                >Rp {{ formatCurrency(item.subtotal) }}</span
              >
            </div>

            <div
              v-if="!selectedService.approvedItems || selectedService.approvedItems.length === 0"
              style="
                padding: 10px 14px;
                color: var(--text-muted);
                font-size: 12px;
                font-style: italic;
              "
            >
              Tidak ada penggantian sparepart atau jasa tambahan.
            </div>
          </div>
        </div>

        <!-- Tagihan Summary Card -->
        <div
          style="
            background: #f8fafc;
            border: 1px solid var(--border-subtle);
            padding: 14px 16px;
            border-radius: 10px;
            margin-bottom: 16px;
          "
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: var(--text-secondary);
              margin-bottom: 6px;
            "
          >
            <span>Total Biaya Jasa Servis:</span>
            <span class="numeric" style="font-weight: 600"
              >Rp {{ formatCurrency(totalJasa) }}</span
            >
          </div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: var(--text-secondary);
              margin-bottom: 6px;
            "
          >
            <span>Total Penggantian Suku Cadang:</span>
            <span class="numeric" style="font-weight: 600"
              >Rp {{ formatCurrency(totalSparepart) }}</span
            >
          </div>

          <div
            v-if="paymentForm.diskon > 0"
            style="
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #dc2626;
              margin-bottom: 6px;
            "
          >
            <span>Potongan / Diskon:</span>
            <span class="numeric" style="font-weight: 600"
              >- Rp {{ formatCurrency(paymentForm.diskon) }}</span
            >
          </div>

          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 15px;
              font-weight: 800;
              border-top: 1px solid var(--border-subtle);
              padding-top: 8px;
              margin-top: 6px;
              color: var(--text-main);
            "
          >
            <span>Total Tagihan (Grand Total):</span>
            <span class="numeric" style="color: #059669; font-size: 17px"
              >Rp {{ formatCurrency(grandTotal) }}</span
            >
          </div>
        </div>

        <!-- Payment Form Controls -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px">
          <div class="form-group" style="margin-bottom: 0">
            <label class="form-label">Metode Pembayaran</label>
            <select v-model="paymentForm.metodeBayar" class="form-input">
              <option value="Tunai">Tunai / Cash</option>
              <option value="Transfer Bank BCA">Transfer Bank BCA</option>
              <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
              <option value="Transfer Bank BRI">Transfer Bank BRI</option>
              <option value="QRIS">QRIS / E-Wallet</option>
              <option value="Piutang Armada">Piutang Armada / Tempo</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0">
            <label class="form-label">Diskon / Potongan (Rp)</label>
            <input
              v-model.number="paymentForm.diskon"
              type="number"
              min="0"
              step="1000"
              class="form-input numeric"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Cash Calculator Section (Only visible for Tunai) -->
        <div
          v-if="paymentForm.metodeBayar === 'Tunai'"
          style="
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 14px;
          "
        >
          <div
            style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: center"
          >
            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="color: #065f46">Uang Diterima (Rp)</label>
              <input
                v-model.number="paymentForm.uangDiterima"
                type="number"
                min="0"
                step="5000"
                class="form-input numeric"
                style="font-weight: 700; font-size: 15px; border-color: #34d399"
                placeholder="0"
              />
            </div>
            <div>
              <span
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 600;
                  color: #065f46;
                  margin-bottom: 4px;
                "
                >Uang Kembalian</span
              >
              <div
                class="numeric"
                :style="{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: isCashDeficit ? '#dc2626' : '#059669',
                }"
              >
                Rp {{ formatCurrency(kembalian) }}
              </div>
              <span v-if="isCashDeficit" style="font-size: 11px; color: #dc2626; font-weight: 600">
                Uang kurang Rp {{ formatCurrency(grandTotal - (paymentForm.uangDiterima || 0)) }}
              </span>
            </div>
          </div>

          <!-- Quick Cash Amount Buttons -->
          <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap">
            <button
              type="button"
              class="btn btn-secondary"
              style="padding: 4px 8px; font-size: 11px"
              @click="paymentForm.uangDiterima = grandTotal"
            >
              Uang Pas (Rp {{ formatCurrency(grandTotal) }})
            </button>
            <button
              v-for="amt in [50000, 100000, 150000, 200000]"
              :key="amt"
              type="button"
              class="btn btn-secondary"
              style="padding: 4px 8px; font-size: 11px"
              @click="paymentForm.uangDiterima = amt"
            >
              Rp {{ formatCurrency(amt) }}
            </button>
          </div>
        </div>

        <!-- Notes / Catatan Kasir -->
        <div class="form-group" style="margin-bottom: 0">
          <label class="form-label">Catatan Kasir (Opsional)</label>
          <input
            v-model="paymentForm.catatan"
            type="text"
            class="form-input"
            placeholder="Contoh: Titip garansi oli 1 minggu, nomor invoice external, dll."
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
        <button
          class="btn btn-primary"
          style="background-color: #059669; border-color: #059669"
          :disabled="isSubmitting || (paymentForm.metodeBayar === 'Tunai' && isCashDeficit)"
          @click="$emit('submit')"
        >
          <i v-if="isSubmitting" class="ph-bold ph-spinner ph-spin"></i>
          <i v-else class="ph-bold ph-check-circle"></i>
          {{ isSubmitting ? 'Memproses...' : 'Proses Bayar & Cetak Invoice' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  selectedService: { type: Object, default: null },
  paymentForm: { type: Object, required: true },
  totalJasa: { type: Number, default: 0 },
  totalSparepart: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  kembalian: { type: Number, default: 0 },
  isCashDeficit: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  formatCurrency: { type: Function, required: true },
});

defineEmits(['update:modelValue', 'submit']);
</script>
