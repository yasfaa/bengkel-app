<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- Brand Header -->
      <div class="brand-header">
        <WrenchlyLogo
          :emblem-size="52"
          :is-stacked="true"
          :is-dark="true"
          custom-title-size="26px"
          custom-tagline-size="11.5px"
        />
      </div>

      <!-- Login Form -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="error-alert">
          <i class="ph-bold ph-warning-circle"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="username">Username Akun</label>
          <div class="input-icon-wrapper">
            <i class="ph-bold ph-user input-icon"></i>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input with-icon"
              placeholder="Masukkan username"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div class="input-icon-wrapper">
            <i class="ph-bold ph-lock-key input-icon"></i>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input with-icon"
              placeholder="Masukkan password"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password-btn"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <i :class="['ph-bold', showPassword ? 'ph-eye-slash' : 'ph-eye']"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block submit-btn" :disabled="isLoading">
          <i v-if="isLoading" class="ph-bold ph-spinner spinner-icon"></i>
          <i v-else class="ph-bold ph-sign-in"></i>
          <span>{{ isLoading ? 'Memverifikasi Sesi...' : 'Masuk ke Sistem' }}</span>
        </button>
      </form>

      <!-- Quick Demo Switcher -->
      <div class="demo-section">
        <div class="demo-divider">
          <span>Pilih Akun Cepat (Demo Mode)</span>
        </div>
        <div class="demo-buttons">
          <button
            type="button"
            class="demo-btn role-admin"
            :disabled="isLoading"
            @click="quickLogin('admin', 'admin123')"
          >
            <i class="ph-bold ph-user-gear"></i>
            <div>
              <strong>Admin / SA</strong>
              <small>admin</small>
            </div>
          </button>

          <button
            type="button"
            class="demo-btn role-mechanic"
            :disabled="isLoading"
            @click="quickLogin('asep', 'asep123')"
          >
            <i class="ph-bold ph-wrench"></i>
            <div>
              <strong>Mekanik Asep</strong>
              <small>asep</small>
            </div>
          </button>

          <button
            type="button"
            class="demo-btn role-kepala"
            :disabled="isLoading"
            @click="quickLogin('kepala', 'kepala123')"
          >
            <i class="ph-bold ph-briefcase"></i>
            <div>
              <strong>Kepala Bengkel</strong>
              <small>kepala</small>
            </div>
          </button>
        </div>
      </div>

      <!-- Security Guarantee Footer -->
      <div class="login-footer">
        <i class="ph-bold ph-shield-check" style="color: #059669"></i>
        <span>Terproteksi In-Memory JWT & HttpOnly Secure Cookies</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import WrenchlyLogo from '../components/WrenchlyLogo.vue';

const emit = defineEmits(['login-success']);

const authStore = useAuthStore();
const uiStore = useUiStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) return;

  errorMessage.value = '';
  isLoading.value = true;

  try {
    const data = await authStore.login(username.value, password.value);
    uiStore.showToast(`👋 Selamat datang kembali, ${data.user.nama}!`, 2500);

    // Set default view based on role
    if (data.user.role === 'MEKANIK') {
      uiStore.activeMenu = 'servis';
    } else if (data.user.role === 'KEPALA_BENGKEL') {
      uiStore.activeMenu = 'dashboard';
    } else {
      uiStore.activeMenu = 'dashboard';
    }

    emit('login-success');
  } catch (err) {
    errorMessage.value = err.message || 'Login gagal. Periksa username dan password Anda.';
  } finally {
    isLoading.value = false;
  }
};

const quickLogin = async (u, p) => {
  username.value = u;
  password.value = p;
  await handleLogin();
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%);
  padding: 20px;
  font-family: inherit;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow:
    0 20px 40px -15px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand-header {
  text-align: center;
  margin-bottom: 26px;
}

.brand-badge {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
  color: #ffffff;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 12px;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
}

.brand-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0;
}

.brand-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 18px;
  pointer-events: none;
}

.form-input.with-icon {
  padding-left: 38px;
  padding-right: 38px;
  height: 42px;
  font-size: 13.5px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  width: 100%;
}

.form-input.with-icon:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  outline: none;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password-btn:hover {
  color: #475569;
}

.submit-btn {
  height: 44px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.demo-section {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px dashed #e2e8f0;
}

.demo-divider {
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.demo-btn i {
  font-size: 20px;
}

.demo-btn strong {
  font-size: 11px;
  color: #1e293b;
  display: block;
}

.demo-btn small {
  font-size: 10px;
  color: #64748b;
}

.demo-btn.role-admin:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.demo-btn.role-mechanic:hover {
  border-color: #10b981;
  background: #ecfdf5;
  color: #047857;
}

.demo-btn.role-kepala:hover {
  border-color: #8b5cf6;
  background: #f5f3ff;
  color: #6d28d9;
}

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 22px;
  font-size: 11px;
  color: #94a3b8;
}
</style>
