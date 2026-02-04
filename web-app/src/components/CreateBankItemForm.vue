<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const name = ref('');

const archiver = ref(false);

const createBankItem = async () => { await fetch("http://localhost:8000/api/v1/bank-items", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        name: name.value,
        archiver: archiver.value
      }),
    })
    .then(response => response.json())
    .then(data => {
      alert('Banque créer avec succès')
      console.log(data);
      name.value = '';     
    })
    .catch(error => console.error('Error:', error))
  }
</script>

<template>
 <div>
    <form @submit.prevent="createBankItem()">
      <label for="name">*Nom:</label>
      <input type="text" v-model="name" placeholder="Nom" :required="true">
      
      <button type="submit">Créer</button>
    </form>   
  </div>
    <router-link to="/my-bank-items">Voir mes banques</router-link>

</template>

<style scoped>

</style>