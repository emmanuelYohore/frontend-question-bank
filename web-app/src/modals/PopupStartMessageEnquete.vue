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

</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">

      <div class="modal-body">
        <h2 class="modal-title">Enquete : {{ enquete?.title }}</h2>
        
        <p class="modal-description">Description : {{ enquete?.description }}</p>

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
  margin: 0 0 30px 0;
}

.modal-description {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.modal-message {
  background-color: transparent;
  border: none;
  padding: 0 0 30px 0;
  border-radius: 0;
  margin: 0 0 30px 0;
  text-align: center;
  font-size: 15px;
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
  background-color: #5b8ee6;
  color: white;
  border: none;
  padding: 14px 60px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 10px;
}

.btn-start:hover {
  background-color: #4a7fdb;
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
    padding: 40px 25px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-description {
    font-size: 14px;
  }
}
</style>
