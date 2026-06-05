import { computed, onMounted, ref, watch } from 'vue';
import Swal from 'sweetalert2';

// Swal mixin dengan custom theme BengkelKu (Slate & Moss)
const SwalConfirm = Swal.mixin({
  customClass: {
    popup: 'swal-popup',
    header: 'swal-header',
    title: 'swal-title',
    htmlContainer: 'swal-text',
    confirmButton: 'btn btn-primary swal-btn',
    cancelButton: 'btn btn-secondary swal-btn',
    icon: 'swal-icon',
  },
  buttonsStyling: false,
  reverseButtons: true,
  showCancelButton: true,
  confirmButtonText: 'Ya, lanjutkan',
  cancelButtonText: 'Batal',
  backdrop: 'rgba(26, 38, 52, 0.45)',
});

const SwalSuccess = Swal.mixin({
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    htmlContainer: 'swal-text',
    confirmButton: 'btn btn-accent swal-btn',
    icon: 'swal-icon',
  },
  buttonsStyling: false,
  confirmButtonText: 'OK',
  timer: 2500,
  timerProgressBar: true,
  showConfirmButton: true,
  backdrop: 'rgba(26, 38, 52, 0.45)',
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createServiceForm = () => ({
  customerName: '',
  phone: '',
  nopol: '',
  brandName: '',
  typeName: '',
  capacityName: '',
  keluhan: '',
  mechanicName: '',
});

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

const createServiceMasterForm = () => ({
  id: null,
  nama: '',
  harga: 0,
  deskripsi: '',
  is_active: true,
});

export function useBengkelApp() {
  const activeMenu = ref('dashboard');
  const menus = [
    { id: 'dashboard', name: 'Dashboard', icon: 'ph-chart-bar' },
    { id: 'servis', name: 'Servis', icon: 'ph-wrench' },
    { id: 'transaksi', name: 'Transaksi', icon: 'ph-receipt' },
    { id: 'stok', name: 'Stok', icon: 'ph-package' },
    { id: 'mekanik', name: 'Mekanik', icon: 'ph-users-three' },
  ];

  const services = ref([]);
  const mechanics = ref([]);
  const motorBrands = ref([]);
  const motorTypes = ref([]);
  const engineCapacities = ref([]);
  const serviceMasters = ref([]);
  const transactions = ref([
    {
      id: 1,
      invoiceNo: 'INV-20260603-001',
      date: '2026-06-03 09:12',
      nopol: 'D 1288 VX',
      motor: 'Honda Beat FI (110cc)',
      servicesText: 'Servis Ringan + Ganti Ban',
      total: 225000,
      paymentMethod: 'Tunai',
    },
  ]);
  const spareparts = ref([
    { id: 1, name: 'Oli Mesin AHM MPX2 0.8L', stok: 15, hargaBeli: 40000, hargaJual: 52000, supplier: 'Astra Otoparts' },
    { id: 2, name: 'Kampas Rem Depan Vario (AHM)', stok: 3, hargaBeli: 28000, hargaJual: 38000, supplier: 'Astra Otoparts' },
    { id: 3, name: 'V-Belt Kit NMAX (Yamaha)', stok: 8, hargaBeli: 110000, hargaJual: 145000, supplier: 'Yamaha Indonesia' },
    { id: 4, name: 'Ban Luar IRC 90/90-14 Tubeless', stok: 4, hargaBeli: 135000, hargaJual: 175000, supplier: 'IRC Sales' },
  ]);

  const searchQuery = ref('');
  const showAddServiceModal = ref(false);
  const showAddStockModal = ref(false);
  const showInvoiceModal = ref(false);
  const selectedService = ref(null);
  const newServiceForm = ref(createServiceForm());
  const invoiceForm = ref(createInvoiceForm());
  const stockForm = ref(createStockForm());
  const serviceMasterForm = ref(createServiceMasterForm());
  const showServiceMasterModal = ref(false);
  const editingServiceMasterId = ref(null);
  const motorTypeLoading = ref(false);
  const errorMessage = ref('');
  const isPrefillingVehicle = ref(false);
  const toastMessage = ref('');
  let toastTimer = null;

  const showToast = (message, duration = 3000) => {
    toastMessage.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.value = '';
    }, duration);
  };

  const clearToast = () => {
    toastMessage.value = '';
    if (toastTimer) clearTimeout(toastTimer);
  };

  const activeMenuName = computed(() => {
    const menu = menus.find((item) => item.id === activeMenu.value);
    return menu ? menu.name : 'BengkelKu';
  });

  const activeServices = computed(() => services.value.filter((service) => service.status !== 'Selesai'));

  const filteredServices = computed(() => {
    if (!searchQuery.value) return services.value;

    const query = searchQuery.value.toLowerCase();
    return services.value.filter((service) => {
      return (
        service.nopol.toLowerCase().includes(query) ||
        service.customerName.toLowerCase().includes(query) ||
        service.motorType.toLowerCase().includes(query)
      );
    });
  });

  const lowStockCount = computed(() => spareparts.value.filter((part) => part.stok <= 5).length);

  const standbyMechanicsCount = computed(() => {
    const busyMechanics = services.value
      .filter((service) => service.status === 'Dikerjakan' && service.mechanicName)
      .map((service) => service.mechanicName);

    return mechanics.value.filter((mechanic) => !busyMechanics.includes(mechanic.nama)).length;
  });

  const totalRevenue = computed(() => transactions.value.reduce((sum, transaction) => sum + transaction.total, 0));

  const selectedServiceMaster = computed(() => {
    if (!invoiceForm.value.serviceMasterId) {
      return serviceMasters.value.find((service) => service.is_active) || serviceMasters.value[0] || null;
    }

    return serviceMasters.value.find((service) => service.id === invoiceForm.value.serviceMasterId) || null;
  });

  const selectedSparepart = computed(() => {
    if (!invoiceForm.value.sparepartId) return null;
    return spareparts.value.find((part) => part.id === invoiceForm.value.sparepartId) || null;
  });

  const calculatedTotalInvoice = computed(() => {
    let total = selectedServiceMaster.value ? selectedServiceMaster.value.harga : 0;
    if (selectedSparepart.value) {
      total += selectedSparepart.value.hargaJual;
    }
    return total;
  });

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID').format(value);

  const getStatusBadgeClass = (status) => {
    if (status === 'Menunggu') return 'badge-pending';
    if (status === 'Dikerjakan') return 'badge-working';
    if (status === 'Selesai') return 'badge-done';
    return '';
  };

  const getMechanicStatus = (mechanicName) => {
    const isBusy = services.value.some((service) => service.status === 'Dikerjakan' && service.mechanicName === mechanicName);
    return isBusy ? 'Bekerja' : 'Standby';
  };

  const getMechanicActiveJob = (mechanicName) => {
    const activeJob = services.value.find((service) => service.mechanicName === mechanicName && service.status === 'Dikerjakan');
    return activeJob ? `${activeJob.customerName} (${activeJob.nopol})` : '-';
  };

  const composeMotorLabel = () => {
    const brand = newServiceForm.value.brandName.trim();
    const type = newServiceForm.value.typeName.trim();
    const capacity = engineCapacities.value.find(
      (item) => item.kapasitas.toLowerCase() === newServiceForm.value.capacityName.trim().toLowerCase()
    );

    const labelParts = [brand, type].filter(Boolean);
    const baseLabel = labelParts.join(' ');
    return capacity ? `${baseLabel} (${capacity.kapasitas})` : baseLabel;
  };

  const apiGet = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Permintaan gagal.');
    }

    return response.json();
  };

  const fetchServices = async () => {
    const data = await apiGet('/api/services');
    services.value = data;
  };

  const fetchMechanics = async () => {
    const data = await apiGet('/api/mechanics');
    mechanics.value = data;
  };

  const fetchMotorBrands = async () => {
    const data = await apiGet('/api/master/brands');
    motorBrands.value = data;
  };

  const fetchEngineCapacities = async () => {
    const data = await apiGet('/api/master/capacities');
    engineCapacities.value = data;
  };

  const fetchServiceMasters = async () => {
    const data = await apiGet('/api/master/services');
    serviceMasters.value = data;
  };

  const fetchMotorTypes = async (brandId) => {
    if (!brandId) {
      motorTypes.value = [];
      return;
    }

    motorTypeLoading.value = true;
    try {
      const data = await apiGet(`/api/master/types?brandId=${encodeURIComponent(brandId)}`);
      motorTypes.value = data;
    } finally {
      motorTypeLoading.value = false;
    }
  };

  const loadReferenceData = async () => {
    try {
      errorMessage.value = '';
      await Promise.all([
        fetchServices(),
        fetchMechanics(),
        fetchServiceMasters(),
      ]);
    } catch (error) {
      errorMessage.value = error.message || 'Gagal memuat data aplikasi.';
      console.error(error);
    }
  };

  const retryAllData = async () => {
    await loadReferenceData();
  };

  const openAddServiceModal = async () => {
    newServiceForm.value = createServiceForm();
    motorTypes.value = [];
    await wait(180);
    await Promise.all([
      fetchMotorBrands(),
      fetchEngineCapacities(),
    ]);
    showAddServiceModal.value = true;
  };

  const openAddStockModal = () => {
    stockForm.value = createStockForm();
    showAddStockModal.value = true;
  };

  const openServiceMasterModal = () => {
    serviceMasterForm.value = createServiceMasterForm();
    editingServiceMasterId.value = null;
    showServiceMasterModal.value = true;
  };

  const editServiceMaster = (serviceMaster) => {
    serviceMasterForm.value = {
      id: serviceMaster.id,
      nama: serviceMaster.nama,
      harga: serviceMaster.harga,
      deskripsi: serviceMaster.deskripsi || '',
      is_active: serviceMaster.is_active,
    };
    editingServiceMasterId.value = serviceMaster.id;
    showServiceMasterModal.value = true;
  };

  const saveServiceMaster = async () => {
    if (!serviceMasterForm.value.nama || serviceMasterForm.value.harga === null || serviceMasterForm.value.harga === '') {
      SwalConfirm.fire({
        title: 'Data Tidak Lengkap',
        text: 'Nama dan harga jasa servis wajib diisi.',
        icon: 'warning',
        iconColor: '#B3737A',
        showCancelButton: false,
        confirmButtonText: 'OK',
      });
      return;
    }

    const payload = {
      nama: serviceMasterForm.value.nama,
      harga: serviceMasterForm.value.harga,
      deskripsi: serviceMasterForm.value.deskripsi,
      is_active: serviceMasterForm.value.is_active,
    };

    try {
      const method = editingServiceMasterId.value ? 'PATCH' : 'POST';
      const url = editingServiceMasterId.value
        ? `/api/master/services/${editingServiceMasterId.value}`
        : '/api/master/services';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => ({}));
        throw new Error(payloadError.error || 'Gagal menyimpan jasa servis.');
      }

      await fetchServiceMasters();
      const savedNama = serviceMasterForm.value.nama;
      const savedHarga = serviceMasterForm.value.harga;
      serviceMasterForm.value = createServiceMasterForm();
      editingServiceMasterId.value = null;
      showServiceMasterModal.value = false;
      SwalSuccess.fire({
        title: 'Jasa Servis Tersimpan',
        text: `${savedNama} — Rp ${formatCurrency(savedHarga)}`,
        icon: 'success',
      });
    } catch (error) {
      console.error('Error saving service master:', error);
      SwalConfirm.fire({
        title: 'Gagal Menyimpan',
        text: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        icon: 'error',
        iconColor: '#B3737A',
        showCancelButton: false,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3D4F5F',
      });
    }
  };

  const deleteServiceMaster = async (serviceMaster) => {
    const result = await SwalConfirm.fire({
      title: 'Hapus Jasa Servis',
      html: `Hapus jasa servis <strong>"${serviceMaster.nama}"</strong>?<br>Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      iconColor: '#B3737A',
      confirmButtonText: 'Ya, hapus',
      confirmButtonColor: '#B3737A',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/master/services/${serviceMaster.id}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        const payloadError = await response.json().catch(() => ({}));
        throw new Error(payloadError.error || 'Gagal menghapus jasa servis.');
      }

      await fetchServiceMasters();
      SwalSuccess.fire({
        title: 'Berhasil Dihapus',
        text: `Jasa "${serviceMaster.nama}" telah dihapus.`,
        icon: 'success',
      });
    } catch (error) {
      console.error('Error deleting service master:', error);
      showToast('❌ Gagal menghapus jasa servis.', 4000);
    }
  };

  watch(
    () => newServiceForm.value.brandName,
    async (brandName) => {
      if (!isPrefillingVehicle.value) {
        newServiceForm.value.typeName = '';
        newServiceForm.value.capacityName = '';
      }

      if (!brandName) {
        motorTypes.value = [];
        return;
      }

      const matchingBrand = motorBrands.value.find(
        (brand) => brand.nama.toLowerCase() === brandName.trim().toLowerCase()
      );

      if (matchingBrand) {
        await fetchMotorTypes(matchingBrand.id);
      } else {
        motorTypes.value = [];
      }
    }
  );

  watch(
    () => newServiceForm.value.nopol,
    async (newNopol) => {
      if (!newNopol || newNopol.length < 4) return;

      try {
        const vehicle = await apiGet(`/api/vehicles/search?nopol=${encodeURIComponent(newNopol.toUpperCase())}`);
        if (!vehicle) return;

        isPrefillingVehicle.value = true;
        newServiceForm.value.customerName = vehicle.customer.nama;
        newServiceForm.value.phone = vehicle.customer.telepon;
        newServiceForm.value.brandName = vehicle.brandName || '';
        newServiceForm.value.capacityName = vehicle.capacityName || '';

        if (vehicle.brandId) {
          await fetchMotorTypes(vehicle.brandId);
        }

        newServiceForm.value.typeName = vehicle.typeName || '';
      } catch (error) {
        console.error('Error searching vehicle on input:', error);
      } finally {
        isPrefillingVehicle.value = false;
      }
    }
  );

  const saveNewService = async () => {
    const errors = [];
    if (!newServiceForm.value.customerName.trim()) errors.push('Nama pelanggan');
    if (!newServiceForm.value.phone.trim()) errors.push('Nomor telepon');
    if (!newServiceForm.value.nopol.trim()) errors.push('Nomor polisi');
    if (!newServiceForm.value.keluhan.trim()) errors.push('Keluhan');

    if (!newServiceForm.value.brandName.trim()) errors.push('Merk motor');
    if (!newServiceForm.value.typeName.trim()) errors.push('Tipe motor');
    if (!newServiceForm.value.capacityName.trim()) errors.push('Kapasitas mesin');

    if (errors.length) {
      showToast(`Harap lengkapi kolom berikut: ${errors.join(', ')}`, 4000);
      return;
    }

    const nopolRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/;
    if (!nopolRegex.test(newServiceForm.value.nopol.trim().toUpperCase())) {
      showToast('Format nomor polisi tidak valid. Contoh: B 1234 ABC', 4000);
      return;
    }

    // Cek apakah mekanik yang dipilih sedang sibuk
    const busyMechanics = services.value
      .filter((item) => item.status === 'Dikerjakan' && item.mechanicName)
      .map((item) => item.mechanicName);

    const payload = {
      ...newServiceForm.value,
      brandName: newServiceForm.value.brandName,
      typeName: newServiceForm.value.typeName,
      capacityName: newServiceForm.value.capacityName,
      motorType: composeMotorLabel(),
    };

    // Jika mekanik dipilih dan sedang sibuk, kirim status awal 'Menunggu'
    if (newServiceForm.value.mechanicName && busyMechanics.includes(newServiceForm.value.mechanicName)) {
      payload.initialStatus = 'Menunggu';
    }

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => ({}));
        throw new Error(payloadError.error || 'Gagal menyimpan data servis.');
      }

      await fetchServices();
      await fetchMechanics();
      const savedNopol = newServiceForm.value.nopol;
      const savedCustomer = newServiceForm.value.customerName;
      newServiceForm.value = createServiceForm();
      motorTypes.value = [];
      showAddServiceModal.value = false;
      SwalSuccess.fire({
        title: 'Servis Baru Tercatat',
        html: `<strong>${savedNopol}</strong> — ${savedCustomer}`,
        icon: 'success',
      });
    } catch (error) {
      console.error('Error saving service:', error);
      showToast('❌ Gagal menyimpan data servis. Silakan coba lagi.', 4000);
    }
  };

  const assignMechanic = async (service) => {
    const busyMechanics = services.value
      .filter((item) => item.status === 'Dikerjakan' && item.mechanicName)
      .map((item) => item.mechanicName);

    const standbyMechanic = mechanics.value.find((mech) => !busyMechanics.includes(mech.nama));
    const mechanicName = standbyMechanic ? standbyMechanic.nama : null;

    if (!mechanicName) {
      showToast('⚠️ Semua mekanik sedang sibuk. Tunggu hingga ada yang tersedia.', 4000);
      return;
    }

    const isMechanicBusy = busyMechanics.includes(mechanicName);
    const newStatus = isMechanicBusy ? 'Menunggu' : 'Dikerjakan';

    const confirmResult = await SwalConfirm.fire({
      title: isMechanicBusy ? 'Mekanik Sedang Sibuk' : 'Konfirmasi Tugas',
      html: isMechanicBusy
        ? `Mekanik <strong>${mechanicName}</strong> sedang mengerjakan servis lain.<br><br>Tetap tugaskan? Servis akan masuk <strong>antrean (Menunggu)</strong>.`
        : `Tugaskan mekanik <strong>${mechanicName}</strong> untuk mengerjakan servis <strong>${service.nopol}</strong>?`,
      icon: 'question',
      iconColor: '#8B9D83',
      confirmButtonText: isMechanicBusy ? 'Ya, tetap tugaskan' : 'Ya, tugaskan',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch(`/api/services/${service.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, mechanicName }),
      });

      if (!response.ok) {
        throw new Error('Gagal menugaskan mekanik.');
      }

      await fetchServices();
      await fetchMechanics();

      if (newStatus === 'Dikerjakan') {
        SwalSuccess.fire({
          title: 'Mekanik Ditugaskan',
          text: `${mechanicName} mulai mengerjakan ${service.nopol}`,
          icon: 'success',
        });
      } else {
        SwalSuccess.fire({
          title: 'Masuk Antrean',
          text: `${mechanicName} ditugaskan — menunggu hingga mekanik selesai`,
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Failed to assign mechanic:', error);
      showToast('❌ Gagal menugaskan mekanik. Silakan coba lagi.', 4000);
    }
  };

  const completeService = async (service) => {
    const confirmResult = await SwalConfirm.fire({
      title: 'Selesaikan Servis',
      html: `Selesaikan servis <strong>${service.nopol}</strong> (<strong>${service.customerName}</strong>)?<br><br>Pastikan semua pekerjaan sudah selesai.`,
      icon: 'question',
      iconColor: '#8B9D83',
      confirmButtonText: 'Ya, selesaikan',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch(`/api/services/${service.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Selesai' }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyelesaikan servis.');
      }

      await fetchServices();
      await fetchMechanics();
      SwalSuccess.fire({
        title: 'Servis Selesai',
        text: `${service.nopol} (${service.customerName}) — siap di-invoice`,
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to complete service:', error);
      showToast('❌ Gagal menyelesaikan servis. Silakan coba lagi.', 4000);
    }
  };

  const createInvoice = (service) => {
    selectedService.value = service;
    invoiceForm.value = createInvoiceForm();
    invoiceForm.value.serviceMasterId = selectedServiceMaster.value ? selectedServiceMaster.value.id : '';
    showInvoiceModal.value = true;
  };

  const processPayment = () => {
    if (!selectedService.value) return;

    const dateStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newInvoiceNo = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-00${transactions.value.length + 1}`;

    if (selectedSparepart.value) {
      if (selectedSparepart.value.stok <= 0) {
        SwalConfirm.fire({
          title: 'Stok Habis',
          text: 'Stok sparepart ini habis!',
          icon: 'warning',
          iconColor: '#B3737A',
          showCancelButton: false,
          confirmButtonText: 'OK',
        });
        return;
      }
      selectedSparepart.value.stok -= 1;
    }

    selectedService.value.isPaid = true;

    const serviceLabel = selectedServiceMaster.value ? selectedServiceMaster.value.nama : 'Jasa Servis';
    let itemsDesc = serviceLabel;

    if (selectedSparepart.value) {
      itemsDesc += ` + Ganti ${selectedSparepart.value.name}`;
    }

    transactions.value.push({
      id: transactions.value.length + 1,
      invoiceNo: newInvoiceNo,
      date: dateStr,
      nopol: selectedService.value.nopol,
      motor: selectedService.value.motorType,
      servicesText: itemsDesc,
      total: calculatedTotalInvoice.value,
      paymentMethod: invoiceForm.value.paymentMethod,
    });

    showInvoiceModal.value = false;
    activeMenu.value = 'transaksi';
  };

  const saveStockIn = () => {
    if (!stockForm.value.sparepartId || stockForm.value.qty <= 0) {
      SwalConfirm.fire({
        title: 'Data Tidak Valid',
        text: 'Pilih sparepart dan isi jumlah stok masuk.',
        icon: 'warning',
        iconColor: '#B3737A',
        showCancelButton: false,
        confirmButtonText: 'OK',
      });
      return;
    }

    const part = spareparts.value.find((item) => item.id === stockForm.value.sparepartId);
    if (part) {
      part.stok += stockForm.value.qty;
      if (stockForm.value.supplier) {
        part.supplier = stockForm.value.supplier;
      }
      SwalSuccess.fire({
        title: 'Stok Ditambahkan',
        html: `<strong>${stockForm.value.qty} unit</strong> ${part.name}<br>Stok sekarang: <strong>${part.stok}</strong>`,
        icon: 'success',
      });
    }

    stockForm.value = createStockForm();
    showAddStockModal.value = false;
  };

  onMounted(() => {
    loadReferenceData();
  });

  return {
    activeMenu,
    menus,
    activeMenuName,
    services,
    mechanics,
    motorBrands,
    motorTypes,
    engineCapacities,
    transactions,
    spareparts,
    searchQuery,
    filteredServices,
    activeServices,
    lowStockCount,
    standbyMechanicsCount,
    totalRevenue,
    getStatusBadgeClass,
    getMechanicStatus,
    getMechanicActiveJob,
    formatCurrency,
    assignMechanic,
    completeService,
    createInvoice,
    openAddServiceModal,
    openAddStockModal,
    showAddServiceModal,
    showAddStockModal,
    showInvoiceModal,
    selectedService,
    selectedSparepart,
    selectedServiceMaster,
    calculatedTotalInvoice,
    invoiceForm,
    stockForm,
    newServiceForm,
    serviceMasterForm,
    processPayment,
    saveNewService,
    saveStockIn,
    serviceMasters,
    showServiceMasterModal,
    openServiceMasterModal,
    editServiceMaster,
    saveServiceMaster,
    deleteServiceMaster,
    motorTypeLoading,
    errorMessage,
    retryAllData,
    toastMessage,
    showToast,
    clearToast,
  };
}