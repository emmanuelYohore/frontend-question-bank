<script setup lang="ts">
import CreateBankItemForm from '@/components/CreateBankItemForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
  <div class="page-container">
    <div class="header">
      <button class="btn-back" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 8 8 12 12 16"/>
          <line x1="16" y1="12" x2="8" y2="12"/>
        </svg>
        Retour
      </button>
      <h1 class="page-title">Créer une banque d'item</h1>
    </div>
    <CreateBankItemForm />
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  position: relative;
  max-width: 600px;
  margin: 0 auto 30px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  margin-bottom: 20px;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #333;
}

.btn-back svg {
  width: 20px;
  height: 20px;
}

.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
}
</style>