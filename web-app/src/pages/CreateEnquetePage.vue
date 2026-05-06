<script setup lang="ts">
import CreateEnqueteForm from '@/components/CreateEnqueteForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
  <div class="page-container">
    <div class="header">
      <button class="back-button" @click="router.back()">
          <span class="back-circle">&#8592;</span>
          <span>Retour</span>
        </button>
      <h1 class="page-title">Créer une enquête</h1>
    </div>
    <CreateEnqueteForm />
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
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

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  color: #1f2937;
}

.back-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.7rem;
  height: 2.7rem;
  border: 2px solid #2d2d2d;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
}
.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
}
</style>
