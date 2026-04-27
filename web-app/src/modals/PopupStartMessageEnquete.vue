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
  'start': [];
  'close': [];
}>();

const handleStart = () => {
  emit('start');
};

// const handleClose = () => {
//   emit('close');
// };
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <!-- <div class="modal-close">
        <button @click="handleClose" class="close-btn">&times;</button>
      </div> -->

      <div class="modal-body">
        <h2 class="modal-title">{{ enquete?.title }}</h2>
        
        <p class="modal-description">{{ enquete?.description }}</p>

        <div v-if="enquete?.start_message" class="modal-message" v-html="enquete.start_message"></div>

        <button @click="handleStart" class="btn-start">
          Commencer
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

.modal-close {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 40px 30px;
  text-align: center;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.modal-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.modal-message {
  background-color: #f9f9f9;
  border-left: 4px solid #007bff;
  padding: 20px;
  border-radius: 4px;
  margin: 25px 0;
  text-align: left;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.modal-message :deep(p) {
  margin: 10px 0;
}

.modal-message :deep(p:first-child) {
  margin-top: 0;
}

.modal-message :deep(p:last-child) {
  margin-bottom: 0;
}

.btn-start {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 14px 40px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 10px;
}

.btn-start:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn-start:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
  }

  .modal-body {
    padding: 30px 20px;
  }

  .modal-title {
    font-size: 20px;
  }
}
</style>
