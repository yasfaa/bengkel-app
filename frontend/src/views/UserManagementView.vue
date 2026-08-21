<template>
  <div class="user-management-page">
    <!-- Header Card -->
    <div
      class="page-header"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      "
    >
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin: 0">
          <i class="ph-bold ph-users-three" style="color: var(--primary-color)"></i>
          Manajemen Akun Pengguna (RBAC)
        </h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px">
          Kelola akun Service Advisor, Teknisi Mekanik, dan Hak Akses Sistem BengkelKu.
        </p>
      </div>

      <button
        class="btn btn-primary"
        style="display: inline-flex; align-items: center; gap: 6px"
        @click="openCreateModal"
      >
        <i class="ph-bold ph-plus-circle"></i>
        <span>Tambah Akun Baru</span>
      </button>
    </div>

    <!-- Users Table Card -->
    <div class="card" style="padding: 0; overflow: hidden; border-radius: 12px">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Username & Email</th>
              <th style="text-align: center">Peran (Role)</th>
              <th>Tautan Mekanik</th>
              <th style="text-align: center">Status Akun</th>
              <th style="text-align: right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div style="display: flex; align-items: center; gap: 10px">
                  <div class="user-avatar" :class="getRoleAvatarClass(user.role)">
                    <i :class="getRoleIcon(user.role)"></i>
                  </div>
                  <div>
                    <strong style="color: var(--text-main); font-size: 13.5px">{{
                      user.nama
                    }}</strong>
                    <div
                      v-if="user.id === authStore.user?.id"
                      style="font-size: 10.5px; color: var(--primary-color); font-weight: 700"
                    >
                      (Akun Anda Saat Ini)
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-weight: 700; color: var(--text-main)">@{{ user.username }}</div>
                <div style="font-size: 11.5px; color: var(--text-muted)">
                  {{ user.email || '-' }}
                </div>
              </td>
              <td style="text-align: center">
                <span :class="['badge', getRoleBadgeClass(user.role)]" style="font-size: 11px">
                  {{ formatRoleName(user.role) }}
                </span>
              </td>
              <td>
                <span
                  v-if="user.mechanicName"
                  class="badge badge-secondary"
                  style="font-size: 11px"
                >
                  <i class="ph-bold ph-wrench"></i> {{ user.mechanicName }}
                </span>
                <span v-else style="color: var(--text-muted); font-size: 12px">-</span>
              </td>
              <td style="text-align: center">
                <span
                  :class="['badge', user.isActive ? 'badge-primary' : 'badge-danger']"
                  style="font-size: 11px"
                >
                  {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td style="text-align: right">
                <div style="display: inline-flex; gap: 6px">
                  <button
                    class="btn btn-secondary btn-sm"
                    style="padding: 5px 9px; font-size: 12px"
                    title="Edit Data Akun"
                    @click="openEditModal(user)"
                  >
                    <i class="ph-bold ph-pencil-simple"></i>
                  </button>

                  <button
                    v-if="user.id !== authStore.user?.id"
                    :class="['btn', 'btn-sm', user.isActive ? 'btn-secondary' : 'btn-primary']"
                    style="padding: 5px 9px; font-size: 12px"
                    :title="user.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'"
                    @click="handleToggleStatus(user)"
                  >
                    <i :class="['ph-bold', user.isActive ? 'ph-prohibit' : 'ph-check-circle']"></i>
                  </button>

                  <button
                    v-if="user.id !== authStore.user?.id"
                    class="btn btn-danger btn-sm"
                    style="padding: 5px 9px; font-size: 12px"
                    title="Hapus Akun"
                    @click="handleDelete(user)"
                  >
                    <i class="ph-bold ph-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted)">
                Belum ada data pengguna.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal (Create / Edit) -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-card" style="max-width: 500px">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="ph-bold ph-user-circle-plus" style="color: var(--primary-color)"></i>
            {{ isEditing ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru' }}
          </h3>
          <button class="modal-close" @click="showModal = false">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Username *</label>
            <input
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="Misal: sa_budi"
              required
              :disabled="isEditing"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Nama Lengkap *</label>
            <input
              v-model="form.nama"
              type="text"
              class="form-input"
              placeholder="Misal: Budi Pratama (SA)"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email (Opsional)</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="budi@bengkelku.id"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Peran Sistem (Role) *</label>
            <select v-model="form.role" class="form-input form-select" required>
              <option value="ADMIN">ADMIN (Service Advisor / Frontdesk / Kasir)</option>
              <option value="MEKANIK">MEKANIK (Teknisi Servis)</option>
              <option value="KEPALA_BENGKEL">KEPALA BENGKEL (Executive & Management)</option>
            </select>
          </div>

          <!-- If Role is MEKANIK, show select mechanic -->
          <div v-if="form.role === 'MEKANIK'" class="form-group">
            <label class="form-label">Tautkan ke Profil Mekanik *</label>
            <select v-model="form.mechanicId" class="form-input form-select" required>
              <option value="">-- Pilih Data Teknisi Mekanik --</option>
              <option v-for="mech in masterStore.mechanics" :key="mech.id" :value="mech.id">
                {{ mech.nama }} (Spesialisasi: {{ mech.spesialisasi }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              {{ isEditing ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Akun *' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Minimal 6 karakter"
              :required="!isEditing"
              minlength="6"
            />
          </div>

          <div
            class="modal-footer"
            style="padding: 16px 0 0 0; display: flex; justify-content: flex-end; gap: 8px"
          >
            <button type="button" class="btn btn-secondary" @click="showModal = false">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <i class="ph-bold ph-check"></i>
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Buat Akun' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '../stores/authStore';
import { useMasterStore } from '../stores/masterStore';
import { useUiStore } from '../stores/uiStore';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../utils/api';

const authStore = useAuthStore();
const masterStore = useMasterStore();
const uiStore = useUiStore();

const users = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref(null);
const isSubmitting = ref(false);

const form = ref({
  username: '',
  nama: '',
  email: '',
  role: 'ADMIN',
  mechanicId: '',
  password: '',
});

const loadUsers = async () => {
  try {
    const res = await apiGet('/api/users');
    users.value = res.data;
  } catch (err) {
    uiStore.showToast('❌ Gagal memuat data pengguna: ' + err.message, 3000);
  }
};

onMounted(() => {
  loadUsers();
  masterStore.fetchMechanics();
});

const formatRoleName = (role) => {
  if (role === 'ADMIN') return 'SA / Admin';
  if (role === 'MEKANIK') return 'Teknisi Mekanik';
  if (role === 'KEPALA_BENGKEL') return 'Kepala Bengkel';
  return role;
};

const getRoleBadgeClass = (role) => {
  if (role === 'ADMIN') return 'badge-primary';
  if (role === 'MEKANIK') return 'badge-working';
  if (role === 'KEPALA_BENGKEL') return 'badge-secondary';
  return 'badge-primary';
};

const getRoleIcon = (role) => {
  if (role === 'ADMIN') return 'ph-bold ph-user-gear';
  if (role === 'MEKANIK') return 'ph-bold ph-wrench';
  if (role === 'KEPALA_BENGKEL') return 'ph-bold ph-briefcase';
  return 'ph-bold ph-user';
};

const getRoleAvatarClass = (role) => {
  if (role === 'ADMIN') return 'avatar-admin';
  if (role === 'MEKANIK') return 'avatar-mechanic';
  if (role === 'KEPALA_BENGKEL') return 'avatar-kepala';
  return '';
};

const openCreateModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  form.value = {
    username: '',
    nama: '',
    email: '',
    role: 'ADMIN',
    mechanicId: '',
    password: '',
  };
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  form.value = {
    username: user.username,
    nama: user.nama,
    email: user.email || '',
    role: user.role,
    mechanicId: user.mechanicId || '',
    password: '',
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      const payload = {
        nama: form.value.nama,
        email: form.value.email || null,
        role: form.value.role,
        mechanicId: form.value.role === 'MEKANIK' ? Number(form.value.mechanicId) : null,
      };
      if (form.value.password) {
        payload.password = form.value.password;
      }
      await apiPut(`/api/users/${editingUserId.value}`, payload);
      uiStore.showToast('✅ Akun pengguna berhasil diperbarui!', 2500);
    } else {
      const payload = {
        username: form.value.username,
        password: form.value.password,
        nama: form.value.nama,
        email: form.value.email || null,
        role: form.value.role,
        mechanicId: form.value.role === 'MEKANIK' ? Number(form.value.mechanicId) : null,
      };
      await apiPost('/api/users', payload);
      uiStore.showToast('✅ Akun pengguna baru berhasil dibuat!', 2500);
    }
    showModal.value = false;
    await loadUsers();
  } catch (err) {
    uiStore.showToast('❌ ' + err.message, 3500);
  } finally {
    isSubmitting.value = false;
  }
};

const handleToggleStatus = async (user) => {
  const action = user.isActive ? 'menonaktifkan' : 'mengaktifkan';
  const result = await Swal.fire({
    title: `Konfirmasi ${action} akun?`,
    text: `Apakah Anda yakin ingin ${action} akun @${user.username} (${user.nama})?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Ya, ${action}`,
    cancelButtonText: 'Batal',
    confirmButtonColor: user.isActive ? '#dc2626' : '#059669',
  });

  if (result.isConfirmed) {
    try {
      await apiPatch(`/api/users/${user.id}/toggle-status`, {});
      uiStore.showToast(
        `Akun @${user.username} berhasil di${user.isActive ? 'nonaktifkan' : 'aktifkan'}.`,
        2000
      );
      await loadUsers();
    } catch (err) {
      uiStore.showToast('❌ ' + err.message, 3000);
    }
  }
};

const handleDelete = async (user) => {
  const result = await Swal.fire({
    title: 'Hapus Akun Pengguna?',
    html: `Apakah Anda yakin ingin menghapus akun <strong>@${user.username}</strong> (${user.nama}) secara permanen?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
  });

  if (result.isConfirmed) {
    try {
      await apiDelete(`/api/users/${user.id}`);
      uiStore.showToast(`Akun @${user.username} berhasil dihapus.`, 2000);
      await loadUsers();
    } catch (err) {
      uiStore.showToast('❌ ' + err.message, 3000);
    }
  }
};
</script>

<style scoped>
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.avatar-admin {
  background: #eff6ff;
  color: #2563eb;
}

.avatar-mechanic {
  background: #ecfdf5;
  color: #059669;
}

.avatar-kepala {
  background: #f5f3ff;
  color: #7c3aed;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1em;
}
</style>
