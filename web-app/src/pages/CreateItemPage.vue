<script setup lang="ts">
import CreateItemForm from '@/components/CreateItemForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

</script>

<template>
  <div class="page-container">
    <button class="btn-back" @click="goBack">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Retour
    </button>
    <div class="header">
      <h1 class="page-title">Créer un item</h1>
    </div>
    <CreateItemForm />
  </div>
</template>

<style scoped>
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
