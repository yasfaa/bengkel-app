import { ref } from 'vue';
import { defineStore } from 'pinia';
import { apiGet, apiPost, apiPatch, apiDelete } from '../utils/api';
import { SwalConfirm, SwalSuccess } from '../utils/swal';
import { useUiStore } from './uiStore';

export const useMasterStore = defineStore('master', () => {
  const uiStore = useUiStore();

  // Master Lists State
  const motorBrands = ref([]);
  const motorTypes = ref([]);
  const engineCapacities = ref([]);
  const serviceMasters = ref([]);
  const suppliers = ref([]);
  const spareparts = ref([]);
  const mechanics = ref([]);
  const motorTypeLoading = ref(false);

  // Form States & Modals
  const serviceMasterForm = ref({
    id: null,
    nama: '',
    harga: 0,
    deskripsi: '',
    estimasi_durasi: 30,
    kategori: 'RINGAN',
    is_active: true,
  });
  const showServiceMasterModal = ref(false);
  const editingServiceMasterId = ref(null);

  const mechanicForm = ref({
    id: null,
    nama: '',
    waktu_kerja: 'Full-time (08:00 - 17:00)',
    spesialisasi: 'Mesin & CVT',
    is_active: true,
  });
  const showMechanicModal = ref(false);
  const editingMechanicId = ref(null);

  const sparepartForm = ref({
    id: null,
    kode_part: '',
    nama: '',
    kategori: 'FAST_MOVING',
    stok: 10,
    min_stok: 5,
    harga_beli: 0,
    harga_jual: 0,
    supplier_id: null,
  });
  const showSparepartModal = ref(false);
  const editingSparepartId = ref(null);

  /* =========================================================================
     Fetch Actions
     ========================================================================= */
  const fetchBrands = async () => {
    try {
      motorBrands.value = await apiGet('/api/master/brands');
    } catch (e) {
      console.error('Error fetching brands:', e);
    }
  };

  const fetchMotorTypes = async (brandId) => {
    if (!brandId) {
      motorTypes.value = [];
      return;
    }
    motorTypeLoading.value = true;
    try {
      motorTypes.value = await apiGet(`/api/master/types?brandId=${encodeURIComponent(brandId)}`);
    } catch (e) {
      console.error('Error fetching motor types:', e);
      motorTypes.value = [];
    } finally {
      motorTypeLoading.value = false;
    }
  };

  const fetchCapacities = async () => {
    try {
      engineCapacities.value = await apiGet('/api/master/capacities');
    } catch (e) {
      console.error('Error fetching capacities:', e);
    }
  };

  const fetchServiceMasters = async () => {
    try {
      serviceMasters.value = await apiGet('/api/master/services');
    } catch (e) {
      console.error('Error fetching service masters:', e);
    }
  };

  const fetchSuppliers = async () => {
    try {
      suppliers.value = await apiGet('/api/master/suppliers');
    } catch (e) {
      console.error('Error fetching suppliers:', e);
    }
  };

  const fetchSpareparts = async () => {
    try {
      const data = await apiGet('/api/master/spareparts');
      spareparts.value = data.map((p) => ({
        id: p.id,
        kode_part: p.kode_part,
        name: p.nama,
        nama: p.nama,
        stok: p.stok,
        min_stok: p.min_stok,
        hargaBeli: p.harga_beli,
        hargaJual: p.harga_jual,
        harga_beli: p.harga_beli,
        harga_jual: p.harga_jual,
        supplier_id: p.supplier_id,
        supplier: p.supplier || (p.supplier_detail ? p.supplier_detail.nama : '-'),
        kategori: p.kategori,
      }));
    } catch (e) {
      console.error('Error fetching spareparts:', e);
    }
  };

  const fetchMechanics = async () => {
    try {
      mechanics.value = await apiGet('/api/mechanics');
    } catch (e) {
      console.error('Error fetching mechanics:', e);
    }
  };

  const fetchAllMasterData = async () => {
    await Promise.all([
      fetchBrands(),
      fetchCapacities(),
      fetchServiceMasters(),
      fetchSuppliers(),
      fetchSpareparts(),
      fetchMechanics(),
    ]);
  };

  /* =========================================================================
     Service Master Actions
     ========================================================================= */
  const openServiceMasterModal = () => {
    serviceMasterForm.value = {
      id: null,
      nama: '',
      harga: 0,
      deskripsi: '',
      estimasi_durasi: 30,
      kategori: 'RINGAN',
      is_active: true,
    };
    editingServiceMasterId.value = null;
    showServiceMasterModal.value = true;
  };

  const editServiceMaster = (service) => {
    editingServiceMasterId.value = service.id;
    serviceMasterForm.value = { ...service };
    showServiceMasterModal.value = true;
  };

  const deleteServiceMaster = async (service) => {
    const result = await SwalConfirm.fire({
      title: 'Hapus Jasa Servis?',
      text: `Apakah Anda yakin ingin menghapus jasa "${service.nama}"?`,
      icon: 'warning',
      confirmButtonText: 'Ya, Hapus',
    });

    if (result.isConfirmed) {
      try {
        await apiDelete(`/api/master/services/${service.id}`);
        await fetchServiceMasters();
        SwalSuccess.fire('Terhapus!', `Jasa ${service.nama} berhasil dihapus.`, 'success');
      } catch (e) {
        console.error(e);
        uiStore.showToast('❌ Gagal menghapus jasa servis.', 3000);
      }
    }
  };

  const saveServiceMaster = async () => {
    if (!serviceMasterForm.value.nama.trim() || serviceMasterForm.value.harga === null) {
      uiStore.showToast('Nama dan harga jasa wajib diisi!', 3000);
      return;
    }

    try {
      const url = editingServiceMasterId.value
        ? `/api/master/services/${editingServiceMasterId.value}`
        : '/api/master/services';

      if (editingServiceMasterId.value) {
        await apiPatch(url, serviceMasterForm.value);
      } else {
        await apiPost(url, serviceMasterForm.value);
      }

      await fetchServiceMasters();
      showServiceMasterModal.value = false;
      SwalSuccess.fire(
        editingServiceMasterId.value ? 'Jasa Diperbarui' : 'Jasa Ditambahkan',
        `Jasa "${serviceMasterForm.value.nama}" berhasil disimpan.`,
        'success'
      );
    } catch (e) {
      console.error(e);
      uiStore.showToast('❌ ' + (e.message || 'Gagal menyimpan jasa.'), 3000);
    }
  };

  /* =========================================================================
     Mechanic Actions
     ========================================================================= */
  const openMechanicModal = () => {
    mechanicForm.value = {
      id: null,
      nama: '',
      waktu_kerja: 'Full-time (08:00 - 17:00)',
      spesialisasi: 'Mesin & CVT',
      is_active: true,
    };
    editingMechanicId.value = null;
    showMechanicModal.value = true;
  };

  const editMechanic = (mechanic) => {
    editingMechanicId.value = mechanic.id;
    mechanicForm.value = { ...mechanic };
    showMechanicModal.value = true;
  };

  const deleteMechanic = async (mechanic) => {
    const result = await SwalConfirm.fire({
      title: 'Hapus Data Mekanik?',
      text: `Apakah Anda yakin ingin menghapus teknisi "${mechanic.nama}"?`,
      icon: 'warning',
      confirmButtonText: 'Ya, Hapus',
    });

    if (result.isConfirmed) {
      try {
        await apiDelete(`/api/mechanics/${mechanic.id}`);
        await fetchMechanics();
        SwalSuccess.fire('Terhapus!', `Data mekanik ${mechanic.nama} telah dihapus.`, 'success');
      } catch (e) {
        console.error(e);
        uiStore.showToast('❌ Gagal menghapus mekanik.', 3000);
      }
    }
  };

  const saveMechanic = async () => {
    if (!mechanicForm.value.nama.trim()) {
      uiStore.showToast('Nama mekanik wajib diisi!', 3000);
      return;
    }

    try {
      const url = editingMechanicId.value
        ? `/api/mechanics/${editingMechanicId.value}`
        : '/api/mechanics';

      if (editingMechanicId.value) {
        await apiPatch(url, mechanicForm.value);
      } else {
        await apiPost(url, mechanicForm.value);
      }

      await fetchMechanics();
      showMechanicModal.value = false;
      SwalSuccess.fire(
        editingMechanicId.value ? 'Mekanik Diperbarui' : 'Mekanik Ditambahkan',
        `Teknisi "${mechanicForm.value.nama}" berhasil disimpan.`,
        'success'
      );
    } catch (e) {
      console.error(e);
      uiStore.showToast('❌ ' + (e.message || 'Gagal menyimpan mekanik.'), 3000);
    }
  };

  /* =========================================================================
     Sparepart Actions
     ========================================================================= */
  const openSparepartModal = () => {
    sparepartForm.value = {
      id: null,
      kode_part: '',
      nama: '',
      kategori: 'FAST_MOVING',
      stok: 10,
      min_stok: 5,
      harga_beli: 0,
      harga_jual: 0,
      supplier_id: null,
    };
    editingSparepartId.value = null;
    showSparepartModal.value = true;
  };

  const editSparepart = (part) => {
    editingSparepartId.value = part.id;
    sparepartForm.value = {
      id: part.id,
      kode_part: part.kode_part,
      nama: part.nama || part.name,
      kategori: part.kategori || 'FAST_MOVING',
      stok: part.stok,
      min_stok: part.min_stok || 5,
      harga_beli: part.harga_beli || part.hargaBeli || 0,
      harga_jual: part.harga_jual || part.hargaJual || 0,
      supplier_id: part.supplier_id || null,
    };
    showSparepartModal.value = true;
  };

  const deleteSparepart = async (part) => {
    const result = await SwalConfirm.fire({
      title: 'Hapus Suku Cadang?',
      text: `Apakah Anda yakin ingin menghapus sparepart "${part.name || part.nama}"?`,
      icon: 'warning',
      confirmButtonText: 'Ya, Hapus',
    });

    if (result.isConfirmed) {
      try {
        await apiDelete(`/api/master/spareparts/${part.id}`);
        await fetchSpareparts();
        SwalSuccess.fire('Terhapus!', `Item ${part.name || part.nama} berhasil dihapus.`, 'success');
      } catch (e) {
        console.error(e);
        uiStore.showToast('❌ Gagal menghapus sparepart.', 3000);
      }
    }
  };

  const saveSparepart = async () => {
    if (!sparepartForm.value.kode_part.trim() || !sparepartForm.value.nama.trim()) {
      uiStore.showToast('Kode part (SKU) dan nama suku cadang wajib diisi!', 3000);
      return;
    }

    try {
      const url = editingSparepartId.value
        ? `/api/master/spareparts/${editingSparepartId.value}`
        : '/api/master/spareparts';

      if (editingSparepartId.value) {
        await apiPatch(url, sparepartForm.value);
      } else {
        await apiPost(url, sparepartForm.value);
      }

      await fetchSpareparts();
      showSparepartModal.value = false;
      SwalSuccess.fire(
        editingSparepartId.value ? 'Sparepart Diperbarui' : 'Sparepart Ditambahkan',
        `Item "${sparepartForm.value.nama}" berhasil disimpan.`,
        'success'
      );
    } catch (e) {
      console.error(e);
      uiStore.showToast('❌ ' + (e.message || 'Gagal menyimpan sparepart.'), 3000);
    }
  };

  return {
    motorBrands,
    motorTypes,
    engineCapacities,
    serviceMasters,
    suppliers,
    spareparts,
    mechanics,
    motorTypeLoading,
    fetchBrands,
    fetchMotorTypes,
    fetchCapacities,
    fetchServiceMasters,
    fetchSuppliers,
    fetchSpareparts,
    fetchMechanics,
    fetchAllMasterData,
    serviceMasterForm,
    showServiceMasterModal,
    openServiceMasterModal,
    editServiceMaster,
    deleteServiceMaster,
    saveServiceMaster,
    mechanicForm,
    showMechanicModal,
    openMechanicModal,
    editMechanic,
    deleteMechanic,
    saveMechanic,
    sparepartForm,
    showSparepartModal,
    openSparepartModal,
    editSparepart,
    deleteSparepart,
    saveSparepart,
  };
});
