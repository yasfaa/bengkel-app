<template>
  <div class="wrenchly-brand" :class="[layoutClass, { 'is-dark': isDark }]">
    <!-- Vector Emblem Mark -->
    <div
      class="wrenchly-icon-wrapper"
      :style="{ width: emblemSize + 'px', height: emblemSize + 'px' }"
    >
      <svg
        :width="emblemSize"
        :height="emblemSize"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="wrenchly-svg"
      >
        <defs>
          <!-- Premium Indigo-Sapphire-Cyan Linear Gradient -->
          <linearGradient id="wrenchlyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="45%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>

          <!-- Outer Glow Drop Shadow -->
          <filter id="wrenchlyDropGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              flood-color="#2563eb"
              flood-opacity="0.4"
            />
          </filter>
        </defs>

        <!-- Base Squircle Shield with Rounded Corners & Glow -->
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="url(#wrenchlyGradient)"
          filter="url(#wrenchlyDropGlow)"
        />

        <!-- Inner Bevel Highlights -->
        <rect
          x="3.75"
          y="3.75"
          width="40.5"
          height="40.5"
          rx="11.25"
          stroke="rgba(255, 255, 255, 0.3)"
          stroke-width="1.5"
          fill="none"
        />

        <!-- Sleek Stylized Precision Wrench Jaw & Handle -->
        <!-- Wrench Upper Head -->
        <path
          d="M33 13.5C31.2 11.7 28.5 11.2 26.2 12.2L22.8 15.6L27.4 20.2L30.8 16.8C31.8 14.5 31.3 11.8 33 13.5Z"
          fill="#ffffff"
          opacity="0.9"
        />
        <!-- Wrench Handle Body -->
        <path
          d="M21.6 16.8L13.2 25.2C12.4 26 12.4 27.3 13.2 28.1L17.9 32.8C18.7 33.6 20 33.6 20.8 32.8L29.2 24.4L21.6 16.8Z"
          fill="#ffffff"
        />

        <!-- Smart Spark Node (Representing Smart Workshop AI / Automation) -->
        <circle cx="34.5" cy="34.5" r="4.5" fill="#38bdf8" />
        <circle cx="34.5" cy="34.5" r="2" fill="#ffffff" />
        <path
          d="M34.5 28.5V30M34.5 39V40.5M28.5 34.5H30M39 34.5H40.5"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- Wordmark & Tagline -->
    <div v-if="!hideText" class="wrenchly-text">
      <div class="wrenchly-title" :style="{ fontSize: titleSize }">
        Wrenchly<span class="wrenchly-accent">.</span>
      </div>
      <div v-if="!hideTagline" class="wrenchly-tagline" :style="{ fontSize: taglineSize }">
        Smart Workshop Management
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  emblemSize: { type: Number, default: 36 },
  hideText: { type: Boolean, default: false },
  hideTagline: { type: Boolean, default: false },
  isStacked: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false },
  customTitleSize: { type: String, default: '' },
  customTaglineSize: { type: String, default: '' },
});

const layoutClass = computed(() => (props.isStacked ? 'is-stacked' : 'is-inline'));

const titleSize = computed(() => {
  if (props.customTitleSize) return props.customTitleSize;
  if (props.emblemSize >= 48) return '24px';
  if (props.emblemSize >= 36) return '18px';
  return '15px';
});

const taglineSize = computed(() => {
  if (props.customTaglineSize) return props.customTaglineSize;
  if (props.emblemSize >= 48) return '12px';
  if (props.emblemSize >= 36) return '10px';
  return '9px';
});
</script>

<style scoped>
.wrenchly-brand {
  display: inline-flex;
  align-items: center;
  user-select: none;
}

.wrenchly-brand.is-inline {
  flex-direction: row;
  gap: 12px;
}

.wrenchly-brand.is-stacked {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.wrenchly-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.wrenchly-brand:hover .wrenchly-icon-wrapper {
  transform: scale(1.05) rotate(-3deg);
}

.wrenchly-svg {
  display: block;
}

.wrenchly-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.wrenchly-title {
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #ffffff;
  display: flex;
  align-items: baseline;
}

.wrenchly-brand.is-dark .wrenchly-title {
  color: var(--text-main, #0f172a);
}

.wrenchly-accent {
  color: #38bdf8;
  font-weight: 900;
}

.wrenchly-tagline {
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-top: 3px;
  opacity: 0.9;
}

.wrenchly-brand.is-dark .wrenchly-tagline {
  color: var(--text-muted, #64748b);
}
</style>
