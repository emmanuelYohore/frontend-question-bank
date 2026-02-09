<script setup lang="ts">

import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { router } from '@/router/routes';

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
  intitule?: string | null
  v1?: string | null
  v2?: string | null
}

const options = ref([
  { text: 'QCM', value: 'qcm' },
  { text: 'QCU', value: 'qcu' },
  { text: 'TEXTE', value: 'texte' },
  { text: 'EVN', value: 'evn' }
])


const formatReponse = ref<FormatReponse>({ type: '' })
const item = ref<Item>({ question: '', obligatoire: true })

const modalites = ref<ModaliteReponse[]>([
  { intitule: '' },
  { intitule: '' }
])

const modaliteEVN = ref<ModaliteReponse>({ v1: '', v2: '' })

const isQCMorQCU = computed(() => 
  formatReponse.value.type === 'qcm' || formatReponse.value.type === 'qcu'
)
const isEVN = computed(() => formatReponse.value.type === 'evn')
const isTexte = computed(() => formatReponse.value.type === 'texte')

const addModalite = () => {
  if (modalites.value.length < 5) {
    modalites.value.push({ intitule: '' })
  }
}

const removeModalite = (index: number) => {
  if (modalites.value.length > 2) {
    modalites.value.splice(index, 1)
  }
}

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

    if (isQCMorQCU.value) {
      for (const modalite of modalites.value) {
        await fetch("http://localhost:8000/api/v1/modalite-reponses", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            format_reponse_id: data1.formatReponse.id,
            item_id: data2.item.id,
            intitule: modalite.intitule,
            v1: null,
            v2: null
          })
        });
      }
      console.log("Modalités QCM/QCU créées");
    } else if (isEVN.value) {
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
          intitule: null,
          v1: modaliteEVN.value.v1,
          v2: modaliteEVN.value.v2
        })
      });
      const data3 = await res3.json();
      console.log("Modalité EVN créée:", data3);
      
        alert('Item créer avec succès')
        router.push('/home')
      
      
    }    
    
  } catch (err) {
    console.error("Erreur :", err);
    alert("Erreur: " + err);
  }
};


  
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="createItem">
      <div class="form-group">
        <label>Type de réponse :</label>
        <select v-model="formatReponse.type" required>
          <option value="">-- Choisir un type --</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Question :</label>
        <input type="text" v-model="item.question" placeholder="Entrez la question" required>
        
      </div>

      <input type="checkbox"  :value=true v-model="item.obligatoire" />
      <label for="oui">OUI</label>



      <div v-if="isQCMorQCU" class="modalites-section">
        <h3>Modalités de réponse (minimum 2, maximum 5)</h3>
        <div v-for="(modalite, index) in modalites" :key="index" class="modalite-item">
          <input 
            type="text" 
            v-model="modalite.intitule" 
            :placeholder="'Intitulé ' + (index + 1)" 
            required
          >
          <button 
            type="button" 
            @click="removeModalite(index)"
            :disabled="modalites.length <= 2"
            class="btn-remove"
          >
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
        <button 
          type="button" 
          @click="addModalite"
          :disabled="modalites.length >= 5"
          class="btn-add"
        >
          + Ajouter une modalité
        </button>
      </div>

      <div v-if="isEVN" class="evn-section">
        <h3>Valeurs de l'échelle</h3>
        <div class="form-group">
          <label>Valeur 1 :</label>
          <input type="text" v-model="modaliteEVN.v1" placeholder="Ex: bien" required>
        </div>
        <div class="form-group">
          <label>Valeur 2 :</label>
          <input type="text" v-model="modaliteEVN.v2" placeholder="Ex: très bien" required>
        </div>
      </div>

      <div v-if="isTexte" class="texte-info">
        <p>Aucune modalité requise pour le texte libre.</p>
      </div>

      <button type="submit" class="btn-submit">Créer l'item</button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modalites-section,
.evn-section {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.modalites-section h3,
.evn-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #555;
}

.modalite-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.modalite-item input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-remove {
  padding: 8px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-remove:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-remove:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-add {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-add:hover:not(:disabled) {
  background-color: #218838;
}

.texte-info {
  padding: 15px;
  background-color: #e7f3ff;
  border-radius: 8px;
  border: 1px solid #b3d9ff;
}

.texte-info p {
  margin: 0;
  color: #0056b3;
}

.btn-submit {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #0056b3;
}
</style>
