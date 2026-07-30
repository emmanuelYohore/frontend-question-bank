<template>
  <transition name="popup-fade">
    <div v-if="popup.isOpen" class="popup-overlay" @click.self="close">
      <div class="popup-card" role="alertdialog" aria-live="assertive">
        <div class="popup-header" :class="popupClass">
          <span class="popup-title">{{ title }}</span>
          <button type="button" class="popup-close" @click="close">×</button>
        </div>
        <div class="popup-body">{{ popup.message }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePopupStore } from '@/stores/popup'

const popup = usePopupStore()

const close = () => {
  popup.closePopup()
}

const title = computed(() => {
  switch (popup.type) {
    case 'success':
      return 'Succès'
    case 'error':
      return 'Erreur'
    default:
      return 'Information'
  }
})

const popupClass = computed(() => {
  return {
    'popup-success': popup.type === 'success',
    'popup-error': popup.type === 'error',
    'popup-info': popup.type === 'info',
  }
})
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2000;
}

.popup-card {
  width: min(90%, 420px);
  background: white;
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  font-weight: 700;
}

.popup-success {
  background: #2f855a;
  color: #fff;
}

.popup-error {
  background: #c53030;
  color: #fff;
}

.popup-info {
  background: #2b6cb0;
  color: #fff;
}

.popup-body {
  padding: 18px;
  color: #333;
  font-size: 0.98rem;
  line-height: 1.5;
}

.popup-close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
}

.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.25s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>
