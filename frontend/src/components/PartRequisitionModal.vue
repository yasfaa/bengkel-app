<template>
  <div
    v-if="modelValue && service"
    class="modal-backdrop"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal-card" style="max-width: 900px">
      <!-- Modal Header -->
      <div class="modal-header">
        <div>
          <h3 class="modal-title">
            <i class="ph-bold ph-wrench" style="color: var(--primary-color)"></i>
            Item Pengerjaan & Permintaan Suku Cadang (PKB)
          </h3>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px">
            No. PKB:
            <strong style="color: var(--primary-color)">{{
              service.nomorPkb || 'PKB-' + service.id
            }}</strong>
            | <strong>{{ service.nopol }}</strong> ({{ service.customerName }} —
            {{ service.motorType }})
          </p>
        </div>
        <button class="modal-close" @click="$emit('update:modelValue', false)">
          <i class="ph-bold ph-x"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto">
        <!-- Form Section: Tambah Item (Hanya untuk MEKANIK) -->
        <div
          v-if="authStore.isMechanic"
          class="card"
          style="background: var(--bg-surface-secondary); margin-bottom: 16px; padding: 14px 18px"
        >
          <div style="display: flex; gap: 8px; margin-bottom: 12px">
            <button
              :class="['btn', activeItemType === 'SPAREPART' ? 'btn-primary' : 'btn-secondary']"
              style="padding: 6px 14px; font-size: 12.5px"
              @click="activeItemType = 'SPAREPART'"
            >
              <i class="ph-bold ph-package"></i> Tambah Suku Cadang Gudang
            </button>
            <button
              :class="['btn', activeItemType === 'JASA' ? 'btn-primary' : 'btn-secondary']"
              style="padding: 6px 14px; font-size: 12.5px"
              @click="activeItemType = 'JASA'"
            >
              <i class="ph-bold ph-gear"></i> Tambah Jasa Servis Ekstra
            </button>
          </div>

          <!-- Form Sparepart -->
          <div
            v-if="activeItemType === 'SPAREPART'"
            class="form-grid"
            style="grid-template-columns: 2fr 1fr 1.5fr auto; align-items: end; gap: 10px"
          >
            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="font-size: 12px">Pilih Sparepart Gudang *</label>
              <select
                v-model="selectedSparepartId"
                class="form-input form-select"
                style="font-size: 12.5px"
              >
                <option value="">-- Pilih Suku Cadang --</option>
                <option
                  v-for="part in masterStore.spareparts"
                  :key="part.id"
                  :value="part.id"
                  :disabled="part.stok <= 0"
                >
                  [{{ part.kode_part }}] {{ part.nama }} — Rp
                  {{ formatCurrency(part.harga_jual) }} (Stok: {{ part.stok }})
                </option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="font-size: 12px">Qty *</label>
              <input
                v-model.number="itemQty"
                type="number"
                min="1"
                :max="maxAvailableStock"
                class="form-input numeric"
                style="font-size: 12.5px"
              />
            </div>

            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="font-size: 12px">Catatan / Alasan Ganti</label>
              <input
                v-model="itemCatatan"
                type="text"
                class="form-input"
                placeholder="Misal: Kampas aus / tipis"
                style="font-size: 12.5px"
              />
            </div>

            <button
              class="btn btn-primary"
              style="padding: 9px 14px; font-size: 12.5px; white-space: nowrap"
              :disabled="!selectedSparepartId || isSubmitting"
              @click="submitAddItem"
            >
              <i class="ph-bold ph-plus"></i> Tambah Part
            </button>
          </div>

          <!-- Form Jasa Servis -->
          <div
            v-else
            class="form-grid"
            style="grid-template-columns: 2fr 1fr 1.5fr auto; align-items: end; gap: 10px"
          >
            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="font-size: 12px">Pilih Jasa Servis *</label>
              <select
                v-model="selectedServiceMasterId"
                class="form-input form-select"
                style="font-size: 12.5px"
              >
                <option value="">-- Pilih Paket Jasa --</option>
                <option v-for="svc in masterStore.serviceMasters" :key="svc.id" :value="svc.id">
                  {{ svc.nama }} — Rp {{ formatCurrency(svc.harga) }}
                </option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="font-size: 12px">Qty *</label>
              <input
                v-model.number="itemQty"
                type="number"
                min="1"
                class="form-input numeric"
                style="font-size: 12.5px"
              />
            </div>

            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label" style="font-size: 12px">Catatan Pengerjaan</label>
              <input
                v-model="itemCatatan"
                type="text"
                class="form-input"
                placeholder="Misal: Kuras minyak rem"
                style="font-size: 12.5px"
              />
            </div>

            <button
              class="btn btn-primary"
              style="padding: 9px 14px; font-size: 12.5px; white-space: nowrap"
              :disabled="!selectedServiceMasterId || isSubmitting"
              @click="submitAddItem"
            >
              <i class="ph-bold ph-plus"></i> Tambah Jasa
            </button>
          </div>
        </div>

        <!-- Notice untuk ADMIN (Service Advisor): Approval & Konsultasi Konsumen -->
        <div
          v-else-if="authStore.isAdmin"
          class="card"
          style="
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            margin-bottom: 16px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12.5px;
            color: #1e40af;
          "
        >
          <i class="ph-bold ph-shield-check" style="font-size: 22px; flex-shrink: 0"></i>
          <div>
            <strong>Mode Service Advisor (Approval Konsumen):</strong> Pengisian suku cadang & jasa tambahan diajukan oleh teknisi mekanik. Anda dapat mengonfirmasi persetujuan konsumen dengan mengeklik status pada kolom <strong>Status Persetujuan</strong> di bawah.
          </div>
        </div>

        <!-- Notice untuk KEPALA BENGKEL: View Only -->
        <div
          v-else
          class="card"
          style="
            background: #f8fafc;
            border: 1px solid var(--border-subtle);
            margin-bottom: 16px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12.5px;
            color: var(--text-secondary);
          "
        >
          <i class="ph-bold ph-eye" style="font-size: 22px; flex-shrink: 0"></i>
          <div>
            <strong>Mode Rekap (View Only):</strong> Rincian item pengerjaan dan permintaan suku cadang ditampilkan untuk monitoring operasional bengkel.
          </div>
        </div>

        <!-- Tabel Rincian Service Items -->
        <div style="margin-top: 12px">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            "
          >
            <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-main)">
              Rincian Jasa & Part pada PKB
            </h4>
            <span style="font-size: 12px; color: var(--text-muted)">
              Total Item: <strong>{{ currentServiceItems.length }} Item</strong>
            </span>
          </div>

          <div
            class="table-container"
            style="border: 1px solid var(--border-color); border-radius: 8px"
          >
            <table class="custom-table" style="font-size: 12.5px">
              <thead>
                <tr>
                  <th style="width: 75px">Tipe</th>
                  <th>Nama Item & Kode</th>
                  <th style="text-align: right">Harga Satuan</th>
                  <th style="text-align: center; width: 55px">Qty</th>
                  <th style="text-align: right">Subtotal</th>
                  <th style="text-align: center">Status Persetujuan Konsumen</th>
                  <th style="text-align: right; width: 70px">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in currentServiceItems"
                  :key="item.id"
                  :class="{ 'row-rejected': item.approvalStatus === 'DITOLAK' }"
                >
                  <td>
                    <span
                      :class="[
                        'badge',
                        item.itemType === 'SPAREPART' ? 'badge-primary' : 'badge-secondary',
                      ]"
                      style="font-size: 10.5px"
                    >
                      {{ item.itemType === 'SPAREPART' ? 'PART' : 'JASA' }}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main)">{{ item.namaItem }}</div>
                    <div v-if="item.kodePart" style="font-size: 11px; color: var(--text-muted)">
                      Kode: {{ item.kodePart }}
                    </div>
                    <div
                      v-if="item.catatan"
                      style="font-size: 11px; color: var(--text-muted); font-style: italic"
                    >
                      "{{ item.catatan }}"
                    </div>
                  </td>
                  <td class="numeric" style="text-align: right">
                    Rp {{ formatCurrency(item.hargaSatuan) }}
                  </td>
                  <td class="numeric" style="text-align: center; font-weight: 700">
                    {{ item.quantity }}
                  </td>
                  <td class="numeric" style="text-align: right">
                    <span
                      :style="{
                        fontWeight: '800',
                        color:
                          item.approvalStatus === 'DISETUJUI'
                            ? 'var(--text-main)'
                            : item.approvalStatus === 'DITOLAK'
                              ? 'var(--text-muted)'
                              : '#d97706',
                        textDecoration: item.approvalStatus === 'DITOLAK' ? 'line-through' : 'none',
                      }"
                    >
                      Rp {{ formatCurrency(item.subtotal) }}
                    </span>
                    <div
                      v-if="item.approvalStatus === 'DITOLAK'"
                      style="font-size: 10px; color: #dc2626; font-weight: 600"
                    >
                      (Tidak Dihitung)
                    </div>
                    <div
                      v-else-if="item.approvalStatus === 'MENUNGGU_KONFIRMASI'"
                      style="font-size: 10px; color: #d97706; font-weight: 600"
                    >
                      (Menunggu)
                    </div>
                  </td>
                  <td style="text-align: center">
                    <!-- Interactive Approval Status Button (Disabled for Kepala Bengkel) -->
                    <button
                      :class="['approval-badge-btn', getApprovalButtonClass(item.approvalStatus)]"
                      :style="{ cursor: authStore.isKepalaBengkel ? 'default' : 'pointer' }"
                      :title="authStore.isKepalaBengkel ? 'Status Persetujuan' : 'Klik untuk mengubah persetujuan konsumen'"
                      @click="!authStore.isKepalaBengkel && handleApprovalClick(item)"
                    >
                      <i :class="getApprovalIcon(item.approvalStatus)"></i>
                      <span>{{ getApprovalLabel(item.approvalStatus) }}</span>
                      <i
                        v-if="!authStore.isKepalaBengkel"
                        class="ph-bold ph-caret-down"
                        style="font-size: 10px; opacity: 0.7; margin-left: 2px"
                      ></i>
                    </button>
                  </td>
                  <td style="text-align: right">
                    <button
                      v-if="authStore.isMechanic"
                      class="btn btn-danger"
                      style="padding: 4px 8px; font-size: 11px"
                      title="Hapus item dari PKB"
                      @click="handleRemoveItem(item.id)"
                    >
                      <i class="ph-bold ph-trash"></i>
                    </button>
                    <span v-else style="color: var(--text-muted); font-size: 11px">-</span>
                  </td>
                </tr>
                <tr v-if="currentServiceItems.length === 0">
                  <td
                    colspan="7"
                    style="text-align: center; padding: 28px; color: var(--text-muted)"
                  >
                    <div style="font-size: 26px; margin-bottom: 4px">📦</div>
                    <div style="font-weight: 600">
                      Belum ada suku cadang atau jasa tambahan pada PKB ini.
                    </div>
                    <div style="font-size: 11.5px; margin-top: 2px">
                      Gunakan form di atas untuk mengajukan permintaan part atau jasa tambahan.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Real-Time Cost Summary Box -->
        <div
          class="card"
          style="
            margin-top: 16px;
            background: #f8fafc;
            border: 1px dashed var(--border-color);
            padding: 14px 20px;
          "
        >
          <div
            style="
              display: grid;
              grid-template-columns: 1fr 1fr 1.5fr;
              gap: 16px;
              align-items: center;
            "
          >
            <div>
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600">
                TOTAL JASA (DISETUJUI)
              </div>
              <div
                class="numeric"
                style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-top: 2px"
              >
                Rp {{ formatCurrency(totalJasaApproved) }}
              </div>
            </div>

            <div>
              <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600">
                TOTAL PART (DISETUJUI)
              </div>
              <div
                class="numeric"
                style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-top: 2px"
              >
                Rp {{ formatCurrency(totalPartApproved) }}
              </div>
            </div>

            <div
              style="
                text-align: right;
                border-left: 2px solid var(--border-color);
                padding-left: 16px;
              "
            >
              <div style="font-size: 11.5px; color: var(--primary-color); font-weight: 700">
                TOTAL ESTIMASI TAGIHAN PKB
              </div>
              <div
                class="numeric"
                style="
                  font-size: 19px;
                  font-weight: 900;
                  color: var(--primary-color);
                  margin-top: 2px;
                "
              >
                Rp {{ formatCurrency(grandTotalApproved) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="modal-footer"
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <div style="font-size: 12px; color: var(--text-muted)">
          <i class="ph-bold ph-info" style="color: var(--primary-color)"></i>
          Hanya item dengan status <strong>Disetujui</strong> yang akan dimasukkan ke dalam total
          tagihan PKB dan invoice kasir.
        </div>
        <button class="btn btn-primary" @click="$emit('update:modelValue', false)">
          <i class="ph-bold ph-check"></i> Selesai & Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '../stores/authStore';
import { useMasterStore } from '../stores/masterStore';
import { useQueueStore } from '../stores/queueStore';
import { useUiStore } from '../stores/uiStore';
import { formatCurrency } from '../utils/formatters';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  service: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'item-updated']);

const authStore = useAuthStore();
const masterStore = useMasterStore();
const queueStore = useQueueStore();
const uiStore = useUiStore();

const activeItemType = ref('SPAREPART');
const selectedSparepartId = ref('');
const selectedServiceMasterId = ref('');
const itemQty = ref(1);
const itemCatatan = ref('');
const isSubmitting = ref(false);

const currentServiceItems = computed(() => {
  if (!props.service) return [];
  const target = queueStore.services.find((s) => s.id === props.service.id);
  return target && target.serviceItems ? target.serviceItems : props.service.serviceItems || [];
});

const maxAvailableStock = computed(() => {
  if (!selectedSparepartId.value) return 99;
  const part = masterStore.spareparts.find((p) => p.id === Number(selectedSparepartId.value));
  return part ? part.stok : 99;
});

const isItemApproved = (item) => {
  return (
    item.approvalStatus === 'DISETUJUI' || (item.isApproved && item.approvalStatus !== 'DITOLAK')
  );
};

const totalJasaApproved = computed(() => {
  let sum = 0;
  if (props.service?.serviceMasterId) {
    const baseSvc = masterStore.serviceMasters.find((s) => s.id === props.service.serviceMasterId);
    if (baseSvc) sum += baseSvc.harga;
  }
  for (const it of currentServiceItems.value) {
    if (it.itemType === 'JASA' && isItemApproved(it)) {
      sum += it.subtotal;
    }
  }
  return sum;
});

const totalPartApproved = computed(() => {
  let sum = 0;
  for (const it of currentServiceItems.value) {
    if (it.itemType === 'SPAREPART' && isItemApproved(it)) {
      sum += it.subtotal;
    }
  }
  return sum;
});

const grandTotalApproved = computed(() => totalJasaApproved.value + totalPartApproved.value);

watch(selectedSparepartId, () => {
  itemQty.value = 1;
});

const getApprovalButtonClass = (status) => {
  if (status === 'DISETUJUI') return 'status-approved';
  if (status === 'DITOLAK') return 'status-rejected';
  return 'status-pending';
};

const getApprovalIcon = (status) => {
  if (status === 'DISETUJUI') return 'ph-bold ph-check-circle';
  if (status === 'DITOLAK') return 'ph-bold ph-x-circle';
  return 'ph-bold ph-clock-countdown';
};

const getApprovalLabel = (status) => {
  if (status === 'DISETUJUI') return 'Disetujui Konsumen';
  if (status === 'DITOLAK') return 'Ditolak Konsumen';
  return 'Menunggu Konfirmasi';
};

/**
 * Step 1: Submit new item (defaults to MENUNGGU_KONFIRMASI)
 */
const submitAddItem = async () => {
  if (!props.service) return;

  isSubmitting.value = true;
  try {
    const payload = {
      itemType: activeItemType.value,
      sparepartId: activeItemType.value === 'SPAREPART' ? selectedSparepartId.value : null,
      serviceMasterId: activeItemType.value === 'JASA' ? selectedServiceMasterId.value : null,
      quantity: itemQty.value,
      approvalStatus: 'MENUNGGU_KONFIRMASI',
      isApproved: false,
      catatan: itemCatatan.value,
    };

    await queueStore.addServiceItem(props.service.id, payload);
    uiStore.showToast('✅ Item diajukan (Status: Menunggu Konfirmasi)', 2500);

    selectedSparepartId.value = '';
    selectedServiceMasterId.value = '';
    itemQty.value = 1;
    itemCatatan.value = '';
    emit('item-updated');
  } catch (error) {
    console.error('Error adding item:', error);
    uiStore.showToast('❌ ' + (error.message || 'Gagal menambahkan item'), 3500);
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Step 2: Handle click on approval status with confirmation modal
 */
const handleApprovalClick = async (item) => {
  if (!props.service) return;

  const currentStatus =
    item.approvalStatus || (item.isApproved ? 'DISETUJUI' : 'MENUNGGU_KONFIRMASI');

  if (currentStatus === 'MENUNGGU_KONFIRMASI') {
    // Modal pilihan 1: Disetujui atau Ditolak
    const result = await Swal.fire({
      title: 'Persetujuan Konsumen',
      html: `
        <div style="text-align: left; font-size: 13.5px; color: var(--text-main); background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 6px;">
          <div style="font-weight: 700; font-size: 15px; color: #1e293b; margin-bottom: 4px;">${item.namaItem}</div>
          <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">Tipe: ${item.itemType} | Qty: <strong>${item.quantity} unit</strong></div>
          <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
            <span>Estimasi Biaya:</span>
            <strong style="color: #2563eb; font-size: 14px;">Rp ${formatCurrency(item.subtotal)}</strong>
          </div>
        </div>
        <p style="margin-top: 14px; font-size: 13px; color: #475569;">
          Apakah konsumen menyetujui pemasangan/penggantian item ini?
        </p>
      `,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '<i class="ph-bold ph-check"></i> Disetujui',
      denyButtonText: '<i class="ph-bold ph-x"></i> Ditolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      denyButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      await updateApprovalStatus(item, 'DISETUJUI');
      uiStore.showToast('✅ Item disetujui konsumen dan masuk ke tagihan.', 2500);
    } else if (result.isDenied) {
      await updateApprovalStatus(item, 'DITOLAK');
      uiStore.showToast('❌ Item ditolak konsumen (tidak masuk ke tagihan).', 2500);
    }
  } else if (currentStatus === 'DISETUJUI') {
    // Modal konfirmasi ubah status langsung ke DITOLAK
    const result = await Swal.fire({
      title: 'Ubah Persetujuan Item?',
      html: `
        <div style="text-align: left; font-size: 13.5px; color: var(--text-main); background: #ecfdf5; padding: 12px; border-radius: 8px; border: 1px solid #a7f3d0; margin-top: 6px;">
          Item <strong>${item.namaItem}</strong> saat ini berstatus <strong style="color: #059669;">Disetujui</strong>.
        </div>
        <p style="margin-top: 12px; font-size: 13px; color: #475569;">
          Apakah Anda ingin mengubah status item ini menjadi <strong>Ditolak Konsumen</strong>? (Biaya akan dikeluarkan dari tagihan).
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="ph-bold ph-x"></i> Ya, Ubah Jadi Ditolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      await updateApprovalStatus(item, 'DITOLAK');
      uiStore.showToast('Item diubah menjadi Ditolak Konsumen.', 2000);
    }
  } else if (currentStatus === 'DITOLAK') {
    // Modal konfirmasi ubah status langsung ke DISETUJUI
    const result = await Swal.fire({
      title: 'Ubah Persetujuan Item?',
      html: `
        <div style="text-align: left; font-size: 13.5px; color: var(--text-main); background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fecaca; margin-top: 6px;">
          Item <strong>${item.namaItem}</strong> saat ini berstatus <strong style="color: #dc2626;">Ditolak Konsumen</strong>.
        </div>
        <p style="margin-top: 12px; font-size: 13px; color: #475569;">
          Apakah konsumen menyetujui pemasangan item ini? (Biaya akan dimasukkan ke tagihan).
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="ph-bold ph-check"></i> Ya, Ubah Jadi Disetujui',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
    });

    if (result.isConfirmed) {
      await updateApprovalStatus(item, 'DISETUJUI');
      uiStore.showToast('✅ Item diubah menjadi Disetujui Konsumen.', 2500);
    }
  }
};

const updateApprovalStatus = async (item, newStatus) => {
  if (!props.service) return;
  try {
    await queueStore.updateServiceItem(props.service.id, item.id, {
      approvalStatus: newStatus,
      isApproved: newStatus === 'DISETUJUI',
    });
    emit('item-updated');
  } catch (e) {
    console.error(e);
    uiStore.showToast('❌ Gagal memperbarui status approval', 3000);
  }
};

const handleRemoveItem = async (itemId) => {
  if (!props.service) return;
  try {
    await queueStore.removeServiceItem(props.service.id, itemId);
    uiStore.showToast('Item berhasil dihapus dari PKB.', 2000);
    emit('item-updated');
  } catch (e) {
    console.error(e);
    uiStore.showToast('❌ Gagal menghapus item', 3000);
  }
};
</script>

<style scoped>
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;
}

.row-rejected {
  opacity: 0.7;
  background-color: #fafafa;
}

/* Approval Interactive Badge Button */
.approval-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 20px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.approval-badge-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.approval-badge-btn.status-pending {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}
.approval-badge-btn.status-pending:hover {
  background: #fde68a;
}

.approval-badge-btn.status-approved {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}
.approval-badge-btn.status-approved:hover {
  background: #d1fae5;
}

.approval-badge-btn.status-rejected {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}
.approval-badge-btn.status-rejected:hover {
  background: #fee2e2;
}
</style>
