import Swal from 'sweetalert2';

export const SwalConfirm = Swal.mixin({
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
  backdrop: 'rgba(15, 23, 42, 0.55)',
});

export const SwalSuccess = Swal.mixin({
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    htmlContainer: 'swal-text',
    confirmButton: 'btn btn-primary swal-btn',
    icon: 'swal-icon',
  },
  buttonsStyling: false,
  confirmButtonText: 'OK',
  timer: 2500,
  timerProgressBar: true,
  showConfirmButton: true,
  backdrop: 'rgba(15, 23, 42, 0.55)',
});
