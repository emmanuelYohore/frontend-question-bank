<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const name = ref('');
const mode = ref('');
const modeOptions = [
  { text: 'Systématique', value: 'systematique' },
  { text: 'Aléatoire', value: 'random' },
];

const archiver = ref(false);

const createBankItem = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/bank-items", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        name: name.value,
        mode: mode.value,
        archiver: archiver.value
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('BankItem créé:', data);
      name.value = '';
      mode.value = '';
      archiver.value = false;
      
    } else {
      console.error('Erreur:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

</script>

<template>
 <div>
    <form @submit.prevent="createBankItem()">
      <label for="name">*Nom:</label>
      <input type="text" v-model="name" placeholder="Nom" :required="true">
      
      <label for="mode">*Mode:</label>
      <select v-model="mode" id="mode" :required="true">
        <option disabled value="">Sélectionner un mode</option>
        <option v-for="option in modeOptions" :key="option.value" :value="option.value">
          {{ option.text }}
        </option>
      </select>

      <label>Archiver:</label>
      <input type="radio" id="true" :value="true" v-model="archiver" />
      <label for="true">Oui</label>

      <input type="radio" id="false" :value="false" v-model="archiver" />
      <label for="false">Non</label>
      
      <button type="submit">Créer</button>
    </form>   
  </div>
</template>

<style lang="css" scoped>

</style>