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
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-body">
        <h2 class="modal-title">{{ enquete?.title }}</h2>
        
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
  font-family: 'Inter', sans-serif;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
  padding: 60px 40px;
  text-align: center;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 40px 0;
}

.modal-message {
  font-size: 16px;
  color: #555;
  margin: 0 0 40px 0;
  line-height: 1.6;
  text-align: left;
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
  background-color: #007bff;
  color: white;
  border: none;
  padding: 14px 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-close:hover {
  background-color: #0056b3;
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
    padding: 40px 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-message {
    font-size: 14px;
  }
}
</style>
