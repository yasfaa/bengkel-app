import { computed, ref, watch } from 'vue';
import { apiGet, apiPost, apiPatch } from '../utils/api';
import { SwalConfirm, SwalSuccess } from '../utils/swal';
import { formatCurrency } from '../utils/formatters';

const createServiceForm = () => ({
  customerName: '',
  phone: '',
  nopol: '',
  brandName: '',
  typeName: '',
  capacityName: '',
  warna: '',
  tahunPembuatan: '',
  kmMasuk: null,
  levelBensin: '1/2',
  catatanKondisi: '',
  serviceMasterId: '',
  estimasiBiaya: 0,
  estimasiDurasi: 30,
  keluhan: '',
  mechanicName: '',
});

export function useQueueService(master = {}, ui = {}) {
  const showToast = ui.showToast || console.log;
  const searchQuery = ui.searchQuery || ref('');
  const {
    motorBrands = ref([]),
    motorTypes = ref([]),
    serviceMasters = ref([]),
    mechanics = ref([]),
    spareparts = ref([]),
    fetchMotorTypes = () => {},
    fetchMechanics = () => {},
  } = master;

  const services = ref([]);
  const showAddServiceModal = ref(false);
  const showPkbModal = ref(false);
  const selectedPkb = ref(null);
  const newServiceForm = ref(createServiceForm());
  const isPrefillingVehicle = ref(false);

  // Stage 2: Pit Allocation & Mechanic Assignment State
  const showAssignModal = ref(false);
  const selectedServiceForAssign = ref(null);

  /* =========================================================================
     Computed Queries
     ========================================================================= */
  const activeServices = computed(() =>
    services.value.filter((service) => service.status !== 'Selesai')
  );

  const filteredServices = computed(() => {
    if (!searchQuery.value) return services.value;

    const query = searchQuery.value.toLowerCase();
    return services.value.filter((service) => {
      return (
        (service.nomorPkb && service.nomorPkb.toLowerCase().includes(query)) ||
        service.nopol.toLowerCase().includes(query) ||
        service.customerName.toLowerCase().includes(query) ||
        service.motorType.toLowerCase().includes(query)
      );
    });
  });

  const lowStockCount = computed(
    () => spareparts.value.filter((part) => part.stok <= (part.min_stok || 5)).length
  );

  const standbyMechanicsCount = computed(() => {
    const busyMechanics = services.value
      .filter((service) => service.status === 'Dikerjakan' && service.mechanicName)
      .map((service) => service.mechanicName);

    return mechanics.value.filter((mechanic) => !busyMechanics.includes(mechanic.nama)).length;
  });

  const getMechanicStatus = (mechanicName) => {
    const isBusy = services.value.some(
      (service) => service.status === 'Dikerjakan' && service.mechanicName === mechanicName
    );
    return isBusy ? 'Bekerja' : 'Standby';
  };

  const getMechanicActiveJob = (mechanicName) => {
    const activeService = services.value.find(
      (service) => service.status === 'Dikerjakan' && service.mechanicName === mechanicName
    );
    return activeService ? `${activeService.nopol} (${activeService.customerName})` : null;
  };

  /* =========================================================================
     Fetch & Watchers
     ========================================================================= */
  const fetchServices = async () => {
    try {
      services.value = await apiGet('/api/services');
    } catch (e) {
      console.error(e);
    }
  };

  // Watch selected service package to auto-calculate estimate cost & duration
  watch(
    () => newServiceForm.value.serviceMasterId,
    (newMasterId) => {
      if (!newMasterId) {
        newServiceForm.value.estimasiBiaya = 0;
        newServiceForm.value.estimasiDurasi = 30;
        return;
      }
      const selected = serviceMasters.value.find((s) => s.id === Number(newMasterId));
      if (selected) {
        newServiceForm.value.estimasiBiaya = selected.harga;
        newServiceForm.value.estimasiDurasi = selected.estimasi_durasi || 30;
      }
    }
  );

  // Watch brand input
  watch(
    () => newServiceForm.value.brandName,
    async (newBrandName) => {
      if (!newBrandName || !newBrandName.trim()) {
        motorTypes.value = [];
        return;
      }
      const found = motorBrands.value.find(
        (b) => b.nama.toLowerCase() === newBrandName.trim().toLowerCase()
      );
      if (found) {
        await fetchMotorTypes(found.id);
      } else {
        motorTypes.value = [];
      }
    }
  );

  // Watch nopol input for auto lookup
  watch(
    () => newServiceForm.value.nopol,
    async (newNopol) => {
      if (!newNopol || newNopol.length < 4) return;

      try {
        const vehicle = await apiGet(
          `/api/vehicles/search?nopol=${encodeURIComponent(newNopol.toUpperCase())}`
        );
        if (!vehicle) return;

        isPrefillingVehicle.value = true;
        newServiceForm.value.customerName = vehicle.customer.nama;
        newServiceForm.value.phone = vehicle.customer.telepon;
        newServiceForm.value.brandName = vehicle.brandName || vehicle.merk || '';
        newServiceForm.value.capacityName = vehicle.capacityName || vehicle.kapasitas_mesin || '';
        if (vehicle.km_terakhir) {
          newServiceForm.value.kmMasuk = vehicle.km_terakhir;
        }

        if (vehicle.brandId) {
          await fetchMotorTypes(vehicle.brandId);
        }

        newServiceForm.value.typeName = vehicle.typeName || vehicle.tipe || '';
        showToast(
          `Kendaraan ditemukan: ${vehicle.customer.nama} (${vehicle.merk} ${vehicle.tipe})`,
          2500
        );
      } catch (error) {
        console.error('Error searching vehicle on input:', error);
      } finally {
        isPrefillingVehicle.value = false;
      }
    }
  );

  /* =========================================================================
     Queue & PKB Actions (Stage 1 & 2)
     ========================================================================= */
  const openAddServiceModal = () => {
    newServiceForm.value = createServiceForm();
    showAddServiceModal.value = true;
  };

  const openPkbModal = (service) => {
    selectedPkb.value = service;
    showPkbModal.value = true;
  };

  const printPkb = () => {
    window.print();
  };

  const composeMotorLabel = () => {
    const parts = [newServiceForm.value.brandName, newServiceForm.value.typeName].filter(Boolean);
    const base = parts.join(' ');
    return newServiceForm.value.capacityName
      ? `${base} (${newServiceForm.value.capacityName})`
      : base;
  };

  const saveNewService = async () => {
    const payload = {
      ...newServiceForm.value,
      motorType: composeMotorLabel(),
    };

    try {
      const created = await apiPost('/api/services', payload);
      await fetchServices();
      await fetchMechanics();
      showAddServiceModal.value = false;

      SwalSuccess.fire({
        title: 'PKB Berhasil Dibuat!',
        html: `<div style="text-align:center;">
          <div style="font-size:18px; font-weight:800; color:#2563eb; margin-bottom:6px;">${created.nomorPkb || 'PKB'}</div>
          <div><strong>${created.nopol}</strong> — ${created.customerName}</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">Status: ${created.status} | Estimasi: Rp ${formatCurrency(created.estimasiBiaya)}</div>
        </div>`,
        icon: 'success',
      });
    } catch (error) {
      console.error('Error saving PKB:', error);
      showToast('❌ Gagal menyimpan data PKB. ' + error.message, 4000);
    }
  };

  /* =========================================================================
     Stage 2: Pit Allocation & Mechanic Assignment Actions
     ========================================================================= */
  const openAssignModal = (service) => {
    selectedServiceForAssign.value = service;
    showAssignModal.value = true;
  };

  const confirmAssignMechanic = async ({
    service,
    mechanicName,
    pitNumber,
    startWorking,
    allowBusyOverride,
  }) => {
    try {
      const targetStatus = startWorking ? 'Dikerjakan' : 'Menunggu';
      await apiPatch(`/api/services/${service.id}/status`, {
        status: targetStatus,
        mechanicName,
        allowBusyOverride: !!allowBusyOverride,
      });

      await fetchServices();
      await fetchMechanics();
      showAssignModal.value = false;

      if (startWorking) {
        SwalSuccess.fire({
          title: 'Servis Dimulai!',
          html: `Motor <strong>${service.nopol}</strong> dialokasikan ke <strong>${pitNumber || 'Pit'}</strong> dan mulai dikerjakan oleh <strong>${mechanicName}</strong>.`,
          icon: 'success',
        });
      } else {
        SwalSuccess.fire({
          title: 'Teknisi Ditugaskan!',
          html: `Motor <strong>${service.nopol}</strong> berhasil dijadwalkan untuk teknisi <strong>${mechanicName}</strong> (Status tetap Menunggu).`,
          icon: 'success',
        });
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Gagal mengalokasikan teknisi: ' + (e.message || ''), 4000);
    }
  };

  const assignMechanic = (service) => {
    openAssignModal(service);
  };

  const completeService = async (service) => {
    const result = await SwalConfirm.fire({
      title: 'Selesaikan Pengerjaan Servis?',
      text: `Motor ${service.nopol} telah selesai diperbaiki dan siap masuk ke billing/kasir.`,
      icon: 'question',
      confirmButtonText: 'Ya, Selesai',
    });

    if (result.isConfirmed) {
      try {
        await apiPatch(`/api/services/${service.id}/status`, { status: 'Selesai' });
        await fetchServices();
        await fetchMechanics();
        SwalSuccess.fire(
          'Servis Selesai!',
          `Motor ${service.nopol} siap dibuatkan invoice.`,
          'success'
        );
      } catch (e) {
        console.error(e);
        showToast('❌ Gagal menyelesaikan servis.', 3000);
      }
    }
  };

  return {
    services,
    activeServices,
    filteredServices,
    lowStockCount,
    standbyMechanicsCount,
    getMechanicStatus,
    getMechanicActiveJob,
    fetchServices,
    newServiceForm,
    showAddServiceModal,
    showPkbModal,
    selectedPkb,
    showAssignModal,
    selectedServiceForAssign,
    openAddServiceModal,
    openPkbModal,
    openAssignModal,
    confirmAssignMechanic,
    printPkb,
    saveNewService,
    assignMechanic,
    completeService,
    isPrefillingVehicle,
  };
}
