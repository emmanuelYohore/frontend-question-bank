<script setup lang="ts">

import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

interface FormatReponse {
  id?: number 
  type: string
}

interface Item {
  id?: number
  question: string
  obligatoire : boolean 
}

interface ModaliteReponse {
  intitule: string
}


const formatReponse = ref<FormatReponse>({ type: '' })
const item = ref<Item>({ question: '', obligatoire: true })
const modaliteReponse = ref<ModaliteReponse>({ intitule: '' })

const createItem = async () => {
  try {
    const res1 = await fetch("http://localhost:8000/api/v1/format-reponses", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${authStore.token}`,

       },
      body: JSON.stringify({
        type: formatReponse.value.type
      })
    });

    const data1 = await res1.json();
    console.log("FormatReponse créé:", data1)

    const res2 = await fetch("http://localhost:8000/api/v1/items", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${authStore.token}`,

       },
      body: JSON.stringify({
            format_reponse_id: data1.formatReponse.id,
            question: item.value.question,
            obligatoire: item.value.obligatoire,
      })
    });
    const data2 = await res2.json();
    console.log("Item créé:", data2)

    const res3 = await fetch("http://localhost:8000/api/v1/modalite-reponses", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${authStore.token}`,

       },
      body: JSON.stringify({
            format_reponse_id: data1.formatReponse.id,
            item_id: data2.item.id,
            intitule: modaliteReponse.value.intitule
      })
    });
    const data3 = await res3.json();
    console.log("Modalité créée:", data3);
    
    if (res3.ok) {
      alert("Item créé avec succès!");
    }
  } catch (err) {
    console.error("Erreur :", err);
    alert("Erreur: " + err);
  }
};


  
</script>

<template>
  <div>
    <form @submit.prevent="createItem">
      <input type="text" v-model="formatReponse.type" placeholder="type" :required="true">
      <input type="text" v-model="item.question" placeholder="question" :required="true">
      <input type="text" v-model="modaliteReponse.intitule" placeholder="intitule" :required="true">
      <button type="submit">Créer l'item</button>
    </form>   
  </div>
</template>

<style scoped>

</style>
