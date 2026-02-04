<script setup lang="ts">

import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const question = ref('')
const obligatoire = ref(true)

const authStore = useAuthStore();

  const createItem = async () => { await fetch("http://localhost:8000/api/v1/items",{
    method: "POST",
    credentials: "include",
    headers:{
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${authStore.token}`,
    },
    body: JSON.stringify({
            question: question.value,
            obligatoire: obligatoire.value,    
          }),
  })
  .then(response => response.json())
  .then(data => {
      alert('Item créer avec succès')
      console.log(data);
     question.value = '',
     obligatoire.value = true;     
    })
  .catch(error => console.error('Error:', error))
}
</script>

<template>
  <div>
    <form @submit.prevent="createItem">
      <input type="text" v-model="question" placeholder="Nom" :required="true">

      <input type="radio" id="oui" value="true" v-model="obligatoire" />
      <label for="oui">Oui</label>

      <input type="radio" id="non" value="false" v-model="obligatoire" />
      <label for="nom">Nom</label>

      <button type="submit">Créer l'item</button>
      
    </form>   
  </div>
</template>

<style scoped>

</style>
