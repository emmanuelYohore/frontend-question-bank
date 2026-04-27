<script lang="ts" setup>
interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  url_enquete?: string;
  archived: boolean;
}

interface Props {
  enquete: Enquete | null;
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'close': [];
}>();

const handleClose = () => {
  emit('close');
  window.location.href = 'https://www.google.com';
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-body">
        <h2 class="modal-title">Enquête : {{ enquete?.title }}</h2>
        
        <div v-if="enquete?.end_message" class="modal-message" v-html="enquete.end_message"></div>

        <button @click="handleClose" class="btn-close">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 0;
  max-width: 700px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-body {
  padding: 50px 50px;
  text-align: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 40px 0;
}

.modal-message {
  font-size: 16px;
  color: #555;
  margin: 0 0 40px 0;
  line-height: 1.6;
  text-align: center;
}

.modal-message :deep(p) {
  margin: 15px 0;
}

.modal-message :deep(p:first-child) {
  margin-top: 0;
}

.modal-message :deep(p:last-child) {
  margin-bottom: 0;
}

.modal-message :deep(strong) {
  font-weight: 600;
  color: #333;
}

.modal-message :deep(em) {
  font-style: italic;
  color: #666;
}

.btn-close {
  background-color: #5b8ee6;
  color: white;
  border: none;
  padding: 14px 60px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-close:hover {
  background-color: #4a7fdb;
  transform: translateY(-2px);
}

.btn-close:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
  }

  .modal-body {
    padding: 40px 25px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-message {
    font-size: 14px;
  }
}
</style>
