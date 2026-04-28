<script setup lang="ts">

import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { router } from '@/router/routes';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';

const authStore = useAuthStore();

//interface pour le format de réponse
interface FormatReponse {
  id?: string 
  type: string
}

//interface pour les modalités de réponse
interface ModaliteReponse {
  id?: string
  intitule?: string | null
  v1?: string | null
  v2?: string | null
  format_reponse?: FormatReponse
}

//interface pour l'item
interface Item {
  id?: string
  question: string
  obligatoire : boolean
  format_reponse?: FormatReponse | null
  modalite_reponses?: ModaliteReponse[]
}

const options = ref([
  { text: 'QCM', value: 'qcm' },
  { text: 'QCU', value: 'qcu' },
  { text: 'TEXTE', value: 'texte' },
  { text: 'EVN', value: 'evn' }
])

const loading = ref(false)


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

//fonctions pour ajouter ou supprimer des modalités de réponse pour les QCM/QCU
const addModalite = () => {
  if (modalites.value.length < 20) {
    modalites.value.push({ intitule: '' })
  }
}

const removeModalite = (index: number) => {
  if (modalites.value.length > 2) {
    modalites.value.splice(index, 1)
  }
}

//fonction pour créer un item avec son format de réponse et ses modalités
const createItem = async () => {
  loading.value = true
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
    })

    if (!res1.ok) {
      alert( "Erreur lors de la création du format de réponse")
      return
    }

    const data1 = await res1.json()
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
    })

    if (!res2.ok) {
      alert( "Erreur lors de la création de l'item")
      return
    }

    const data2 = await res2.json()
    console.log("Item créé:", data2)

    if (isQCMorQCU.value) {
      for (const modalite of modalites.value) {
        const resModalite = await fetch("http://localhost:8000/api/v1/modalite-reponses", {
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
        })

        if (!resModalite.ok) {
          alert( "Erreur lors de la création des modalités")
          return
        }
      }
      console.log("Modalités QCM/QCU créées")
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
      })

      if (!res3.ok) {
        alert( "Erreur lors de la création de la modalité EVN")
        return
      }

      const data3 = await res3.json()
      console.log("Modalité EVN créée:", data3)
    }

    alert("Item créé avec succès")
    router.push('/my-items')
  } catch (err) {
    console.error("Erreur :", err)
    alert("Erreur: " + err)
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="form-wrapper">
    <div class="form-card">
      <form @submit.prevent="createItem">
        <div class="form-group">
          <label>Type de réponse :</label>
          <select v-model="formatReponse.type" required>
            <option value="">--- Choisir un type ---</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Question :</label>
          <input type="text" v-model="item.question" placeholder="Entrez la question" required>
        </div>

        <div class="form-group checkbox-group">
          <label>Obligatoire :</label>
          <div class="checkbox-wrapper">
            <input type="checkbox" id="obligatoire" :value="true" v-model="item.obligatoire" />
            <label for="obligatoire" class="checkbox-label">OUI</label>
          </div>
        </div>



      <div v-if="isQCMorQCU" class="modalites-section">
        <h3>Modalités de réponse (minimum 2)</h3>
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
          >X
            
          </button>
        </div>
        <button 
          type="button" 
          @click="addModalite"
          :disabled="modalites.length >= 20"
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

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Chargement...' : 'Créer' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
 * {
   margin: 0;
   padding: 0;
   background-color: white;
   font-family: 'Arial', sans-serif;
 }
.form-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #5b9aff;
}

.form-group input::placeholder {
  color: #aaa;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-weight: 400;
  margin: 0;
  cursor: pointer;
}

.modalites-section,
.evn-section {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.modalites-section h3,
.evn-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.modalite-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.modalite-item input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.btn-remove {
  padding: 10px 14px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-remove:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-remove:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-add {
  padding: 10px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-add:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-add:hover:not(:disabled) {
  background-color: #218838;
}

.texte-info {
  padding: 16px;
  background-color: #e7f3ff;
  border-radius: 8px;
  border: 1px solid #b3d9ff;
}

.texte-info p {
  margin: 0;
  color: #0056b3;
  font-size: 14px;
}

.btn-submit {
  padding: 12px 24px;
  background-color: #5b9aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.btn-submit:hover {
  background-color: #4a89e8;
}
</style>
