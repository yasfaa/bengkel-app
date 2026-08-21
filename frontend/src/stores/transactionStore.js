import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { SwalSuccess } from '../utils/swal';
import { formatCurrency } from '../utils/formatters';
import { useUiStore } from './uiStore';
import { useMasterStore } from './masterStore';
import { useQueueStore } from './queueStore';

const createInvoiceForm = () => ({
  serviceMasterId: '',
  sparepartId: '',
  paymentMethod: 'Tunai',
});

const createStockForm = () => ({
  sparepartId: '',
  qty: 10,
  supplier: '',
});

export const useTransactionStore = defineStore('transaction', () => {
  const uiStore = useUiStore();
  const masterStore = useMasterStore();
  const queueStore = useQueueStore();

  const transactions = ref([
    {
      id: 1,
      invoiceNo: 'INV-20260818-001',
      date: '2026-08-18 09:12',
      nopol: 'B 4455 KZX',
      motor: 'Honda Beat (110cc)',
      servicesText: 'Servis Ringan + Ganti Oli MPX2',
      total: 75000,
      paymentMethod: 'Tunai',
    },
  ]);

  const showInvoiceModal = ref(false);
  const selectedService = ref(null);
  const invoiceForm = ref(createInvoiceForm());

  const showAddStockModal = ref(false);
  const stockForm = ref(createStockForm());

  /* =========================================================================
     Computed Calculations
     ========================================================================= */
  const totalRevenue = computed(() => transactions.value.reduce((sum, t) => sum + t.total, 0));

  const selectedServiceMaster = computed(() => {
    if (!invoiceForm.value.serviceMasterId) {
      return (
        masterStore.serviceMasters.find((s) => s.is_active) || masterStore.serviceMasters[0] || null
      );
    }
    return (
      masterStore.serviceMasters.find((s) => s.id === invoiceForm.value.serviceMasterId) || null
    );
  });

  const selectedSparepart = computed(() => {
    if (!invoiceForm.value.sparepartId) return null;
    return masterStore.spareparts.find((p) => p.id === invoiceForm.value.sparepartId) || null;
  });

  const calculatedTotalInvoice = computed(() => {
    let total = selectedServiceMaster.value ? selectedServiceMaster.value.harga : 0;
    if (selectedSparepart.value) {
      total += selectedSparepart.value.hargaJual || selectedSparepart.value.harga_jual || 0;
    }
    return total;
  });

  /* =========================================================================
     Invoice & Stock Actions
     ========================================================================= */
  const createInvoice = (service) => {
    selectedService.value = service;
    invoiceForm.value = createInvoiceForm();
    if (service.serviceMasterId) {
      invoiceForm.value.serviceMasterId = service.serviceMasterId;
    }
    showInvoiceModal.value = true;
  };

  const processPayment = async () => {
    if (!selectedService.value) return;

    try {
      const invoiceNo = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.value.length + 1).padStart(3, '0')}`;
      const serviceName = selectedServiceMaster.value?.nama || 'Servis Umum';
      const partName = selectedSparepart.value
        ? ` + ${selectedSparepart.value.name || selectedSparepart.value.nama}`
        : '';

      transactions.value.unshift({
        id: Date.now(),
        invoiceNo,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        nopol: selectedService.value.nopol,
        motor: selectedService.value.motorType,
        servicesText: `${serviceName}${partName}`,
        total: calculatedTotalInvoice.value,
        paymentMethod: invoiceForm.value.paymentMethod,
      });

      // Kurangi stok lokal sparepart jika dipilih
      if (selectedSparepart.value) {
        const part = masterStore.spareparts.find((p) => p.id === selectedSparepart.value.id);
        if (part && part.stok > 0) {
          part.stok -= 1;
        }
      }

      // Tandai isPaid di antrean servis
      const svc = queueStore.services.find((s) => s.id === selectedService.value.id);
      if (svc) {
        svc.isPaid = true;
      }

      showInvoiceModal.value = false;
      SwalSuccess.fire({
        title: 'Pembayaran Berhasil!',
        html: `Invoice <strong>${invoiceNo}</strong> sebesar <strong>Rp ${formatCurrency(calculatedTotalInvoice.value)}</strong> lunas via ${invoiceForm.value.paymentMethod}.`,
        icon: 'success',
      });
    } catch (e) {
      console.error(e);
      uiStore.showToast('❌ Gagal memproses pembayaran invoice.', 3000);
    }
  };

  const openAddStockModal = () => {
    stockForm.value = createStockForm();
    showAddStockModal.value = true;
  };

  const saveStockIn = () => {
    if (!stockForm.value.sparepartId || stockForm.value.qty <= 0) {
      uiStore.showToast('Pilih sparepart dan masukkan jumlah unit yang valid!', 3000);
      return;
    }

    const part = masterStore.spareparts.find((p) => p.id === stockForm.value.sparepartId);
    if (part) {
      part.stok += stockForm.value.qty;
      showAddStockModal.value = false;
      SwalSuccess.fire(
        'Stok Masuk Tercatat',
        `Menambahkan <strong>${stockForm.value.qty} unit</strong> ${part.name || part.nama}. Stok sekarang: ${part.stok} unit.`,
        'success'
      );
    }
  };

  return {
    transactions,
    totalRevenue,
    showInvoiceModal,
    selectedService,
    selectedSparepart,
    selectedServiceMaster,
    calculatedTotalInvoice,
    invoiceForm,
    createInvoice,
    processPayment,
    stockForm,
    showAddStockModal,
    openAddStockModal,
    saveStockIn,
  };
});
