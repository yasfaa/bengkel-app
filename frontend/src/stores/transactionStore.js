import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { apiGet, apiPost } from '../utils/api';
import { SwalConfirm, SwalSuccess } from '../utils/swal';
import { formatCurrency } from '../utils/formatters';
import { useUiStore } from './uiStore';
import { useQueueStore } from './queueStore';
import { useMasterStore } from './masterStore';

const createPaymentForm = () => ({
  serviceId: null,
  metodeBayar: 'Tunai',
  diskon: 0,
  uangDiterima: 0,
  catatan: '',
});

export const useTransactionStore = defineStore('transaction', () => {
  const uiStore = useUiStore();
  const queueStore = useQueueStore();

  const transactions = ref([]);
  const unpaidServices = ref([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);

  // Modal & Selection State
  const showInvoiceModal = ref(false);
  const showReceiptModal = ref(false);
  const selectedService = ref(null);
  const activeInvoice = ref(null);
  const paymentForm = ref(createPaymentForm());

  // Search & Filter State
  const searchQuery = ref('');
  const paymentMethodFilter = ref('');

  /* =========================================================================
     Computed Analytics & Calculations
     ========================================================================= */
  const totalRevenue = computed(() =>
    transactions.value.reduce((sum, t) => sum + Number(t.total || 0), 0)
  );

  const todayRevenue = computed(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return transactions.value
      .filter((t) => (t.tglBayar || t.createdAt || '').startsWith(todayStr))
      .reduce((sum, t) => sum + Number(t.total || 0), 0);
  });

  const unpaidCount = computed(() => unpaidServices.value.length);

  const totalJasa = computed(() => {
    if (!selectedService.value) return 0;
    return Number(selectedService.value.totalJasa || 0);
  });

  const totalSparepart = computed(() => {
    if (!selectedService.value) return 0;
    return Number(selectedService.value.totalSparepart || 0);
  });

  const totalGross = computed(() => totalJasa.value + totalSparepart.value);

  const grandTotal = computed(() => {
    const diskon = Math.max(0, Number(paymentForm.value.diskon || 0));
    return Math.max(0, totalGross.value - diskon);
  });

  const kembalian = computed(() => {
    if (paymentForm.value.metodeBayar !== 'Tunai') return 0;
    const received = Number(paymentForm.value.uangDiterima || 0);
    return Math.max(0, received - grandTotal.value);
  });

  const isCashDeficit = computed(() => {
    if (paymentForm.value.metodeBayar !== 'Tunai') return false;
    const received = Number(paymentForm.value.uangDiterima || 0);
    return received < grandTotal.value;
  });

  const filteredTransactions = computed(() => {
    return transactions.value.filter((t) => {
      const matchSearch =
        !searchQuery.value ||
        (t.noInvoice || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (t.nopol || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (t.customerName || '').toLowerCase().includes(searchQuery.value.toLowerCase());

      const matchMethod =
        !paymentMethodFilter.value || t.metodeBayar === paymentMethodFilter.value;

      return matchSearch && matchMethod;
    });
  });

  /* =========================================================================
     API Actions
     ========================================================================= */
  const fetchTransactions = async () => {
    isLoading.value = true;
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.value) queryParams.append('search', searchQuery.value);
      if (paymentMethodFilter.value) queryParams.append('metodeBayar', paymentMethodFilter.value);

      const url = `/api/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await apiGet(url);
      transactions.value = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      uiStore.showToast(err.message || 'Gagal memuat riwayat transaksi kasir.', 3000);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUnpaidServices = async () => {
    try {
      const data = await apiGet('/api/transactions/unpaid');
      unpaidServices.value = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to fetch unpaid services:', err);
    }
  };

  const openPaymentModal = (service) => {
    if (!service) return;

    if (service.isPaid) {
      uiStore.showToast('Servis ini sudah lunas dan memiliki invoice pembayaran.', 3000);
      return;
    }

    let basePackageName =
      service.basePackageName ||
      service.servicePackageName ||
      service.serviceMaster?.nama ||
      'Paket Servis Dasar';

    let basePackagePrice = Number(
      service.basePackagePrice ??
      service.serviceMaster?.harga ??
      0
    );

    // If base package price is still 0, attempt lookup in master catalog
    try {
      const masterStore = useMasterStore();
      const sMasterId = service.serviceMasterId || service.service_master_id;
      if (sMasterId && masterStore.serviceMasters?.length > 0) {
        const found = masterStore.serviceMasters.find((m) => m.id === sMasterId);
        if (found) {
          if (!basePackageName || basePackageName === 'Paket Servis Dasar') {
            basePackageName = found.nama;
          }
          if (!basePackagePrice) {
            basePackagePrice = Number(found.harga || 0);
          }
        }
      }
    } catch {
      // Ignored if masterStore not ready
    }

    // Extract approved items (sparepart & extra jasa)
    const rawItems =
      service.approvedItems ||
      (service.serviceItems
        ? service.serviceItems.filter(
            (it) =>
              it.isApproved === true ||
              it.is_approved === true ||
              it.approvalStatus === 'DISETUJUI' ||
              it.approval_status === 'DISETUJUI'
          )
        : []);

    const approvedItems = rawItems.map((it) => ({
      id: it.id,
      itemType: it.itemType || it.item_type,
      namaItem: it.namaItem || it.nama_item || 'Item',
      quantity: it.quantity || 1,
      hargaSatuan: Number(it.hargaSatuan || it.harga_satuan || 0),
      subtotal: Number(
        it.subtotal ||
        Number(it.hargaSatuan || it.harga_satuan || 0) * (it.quantity || 1)
      ),
    }));

    let extraJasa = 0;
    let totalSparepartVal = 0;
    for (const item of approvedItems) {
      if (item.itemType === 'JASA') {
        extraJasa += item.subtotal;
      } else if (item.itemType === 'SPAREPART') {
        totalSparepartVal += item.subtotal;
      }
    }

    const totalJasaVal =
      typeof service.totalJasa === 'number' && service.totalJasa > 0
        ? service.totalJasa
        : basePackagePrice + extraJasa;

    const totalSparepartValFinal =
      typeof service.totalSparepart === 'number' && service.totalSparepart > 0
        ? service.totalSparepart
        : totalSparepartVal;

    const grandTotalVal =
      typeof service.grandTotal === 'number' && service.grandTotal > 0
        ? service.grandTotal
        : totalJasaVal + totalSparepartValFinal;

    selectedService.value = {
      ...service,
      basePackageName,
      basePackagePrice,
      approvedItems,
      totalJasa: totalJasaVal,
      totalSparepart: totalSparepartValFinal,
      grandTotal: grandTotalVal,
    };

    paymentForm.value = {
      serviceId: service.id,
      metodeBayar: 'Tunai',
      diskon: 0,
      uangDiterima: 0,
      catatan: '',
    };

    showInvoiceModal.value = true;
  };

  const submitPayment = async () => {
    if (!selectedService.value) return;

    if (paymentForm.value.metodeBayar === 'Tunai' && isCashDeficit.value) {
      uiStore.showToast(
        `Nominal uang tunai kurang dari total tagihan (Rp ${formatCurrency(grandTotal.value)})!`,
        3500
      );
      return;
    }

    const confirmRes = await SwalConfirm.fire({
      title: 'Proses Pembayaran Kasir?',
      html: `
        <div style="text-align: left; font-size: 14px; color: var(--text-secondary);">
          <p><strong>No. Polisi:</strong> ${selectedService.value.nopol}</p>
          <p><strong>Pelanggan:</strong> ${selectedService.value.customerName}</p>
          <p><strong>Metode Bayar:</strong> ${paymentForm.value.metodeBayar}</p>
          <p><strong>Total Tagihan:</strong> <span style="color: #059669; font-weight: 700;">Rp ${formatCurrency(grandTotal.value)}</span></p>
        </div>
      `,
      icon: 'question',
      confirmButtonText: '<i class="ph-bold ph-check"></i> Ya, Proses & Lunas',
      cancelButtonText: 'Batal',
    });

    if (!confirmRes.isConfirmed) return;

    isSubmitting.value = true;
    try {
      const payload = {
        serviceId: selectedService.value.id,
        metodeBayar: paymentForm.value.metodeBayar,
        diskon: Number(paymentForm.value.diskon || 0),
        uangDiterima: Number(paymentForm.value.uangDiterima || 0),
        catatan: paymentForm.value.catatan || null,
      };

      const res = await apiPost('/api/transactions', payload);
      const createdTrx = res.data;

      // Close payment modal & open receipt
      showInvoiceModal.value = false;
      activeInvoice.value = createdTrx;
      showReceiptModal.value = true;

      // Refresh stores
      await Promise.all([fetchTransactions(), fetchUnpaidServices(), queueStore.fetchServices()]);

      SwalSuccess.fire({
        title: 'Pembayaran Lunas!',
        html: `Invoice <strong>${createdTrx.noInvoice}</strong> sebesar <strong>Rp ${formatCurrency(createdTrx.total)}</strong> berhasil dibayar lunas via ${createdTrx.metodeBayar}.`,
        icon: 'success',
      });
    } catch (err) {
      console.error('Payment processing failed:', err);
      uiStore.showToast(err.message || 'Gagal memproses pembayaran kasir.', 4000);
    } finally {
      isSubmitting.value = false;
    }
  };

  const viewReceipt = async (transaction) => {
    try {
      const fullTrx = await apiGet(`/api/transactions/${transaction.id}`);
      activeInvoice.value = fullTrx;
      showReceiptModal.value = true;
    } catch (err) {
      console.error('Failed to get transaction detail:', err);
      activeInvoice.value = transaction;
      showReceiptModal.value = true;
    }
  };

  return {
    transactions,
    unpaidServices,
    isLoading,
    isSubmitting,
    showInvoiceModal,
    showReceiptModal,
    selectedService,
    activeInvoice,
    paymentForm,
    searchQuery,
    paymentMethodFilter,
    totalRevenue,
    todayRevenue,
    unpaidCount,
    totalJasa,
    totalSparepart,
    totalGross,
    grandTotal,
    kembalian,
    isCashDeficit,
    filteredTransactions,
    fetchTransactions,
    fetchUnpaidServices,
    openPaymentModal,
    submitPayment,
    viewReceipt,
  };
});
