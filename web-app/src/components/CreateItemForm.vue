<script setup lang="ts">

import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { router } from '@/router/routes';
import PopupAddItemCreateToBank from '@/modals/PopupAddItemCreateToBank.vue';
import { notify } from '@/utils/popup'
import { API_V1_URL } from '@/config/api'

const authStore = useAuthStore();
const showPopup = ref(false)
const createdItemId = ref('')
const valueItemQuestionCreated = ref('')

//interface pour le format de réponse
interface FormatReponse {
  id?: string 
  type: string
}

//interface pour les modalités de réponse
interface ModaliteReponse {
  id?: string
  intitule?: string | null
  min_value?: string | null
  max_value?: string | null
  format_reponse?: FormatReponse
}

//interface pour l'item
interface Item {
  id?: string
  question: string
  min_case_to_check: number | null    // ← sans ?, toujours null ou number
  max_case_to_check: number | null    // ← idem
  nom_court: string
  obligatoire: boolean
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
const item = ref<Item>({
  question: '',
  min_case_to_check: null,
  max_case_to_check: null,
  obligatoire: false,
  nom_court: ''
})

const modalites = ref<ModaliteReponse[]>([
  { intitule: '' },
  { intitule: '' }
])

const modaliteEVN = ref<ModaliteReponse>({ min_value: '', max_value: '' })

const isQCMorQCU = computed(() => 
  formatReponse.value.type === 'qcm' || formatReponse.value.type === 'qcu'
)

const isQCM = computed(() => formatReponse.value.type === 'qcm')
const isQCU = computed(() => formatReponse.value.type === 'qcu')
const isEVN = computed(() => formatReponse.value.type === 'evn')
const isTexte = computed(() => formatReponse.value.type === 'texte')

// Options dynamiques pour min (de 1 à max-1, ou jusqu'au nombre de modalités - 1)
const minCaseOptions = computed(() => {
  const upperBound = item.value.max_case_to_check !== null
    ? item.value.max_case_to_check! - 1
    : modalites.value.length - 1
  const result = []
  for (let i = 1; i <= upperBound; i++) result.push(i)
  return result
})

// Options dynamiques pour max (de min+1 jusqu'au nombre de modalités)
const maxCaseOptions = computed(() => {
  const lowerBound = item.value.min_case_to_check !== null
    ? item.value.min_case_to_check! + 1
    : 2
  const result = []
  for (let i = lowerBound; i <= modalites.value.length; i++) result.push(i)
  return result
})

// Fonctions pour ajouter ou supprimer des modalités de réponse pour les QCM/QCU
const addModalite = () => {
  if (modalites.value.length < 20) {
    modalites.value.push({ intitule: '' })
    if (item.value.max_case_to_check === modalites.value.length - 1) {
      item.value.max_case_to_check = modalites.value.length
    }
  }
}

const removeModalite = (index: number) => {
  if (modalites.value.length > 2) {
    modalites.value.splice(index, 1)
    // Recaler max si supérieur au nouveau nombre de modalités
    if (item.value.max_case_to_check !== null && item.value.max_case_to_check > modalites.value.length) {
      item.value.max_case_to_check = modalites.value.length
    }
    // Recaler min si supérieur ou égal au max
    if (
      item.value.min_case_to_check !== null &&
      item.value.max_case_to_check !== null &&
      item.value.min_case_to_check >= item.value.max_case_to_check
    ) {
      item.value.min_case_to_check = Math.max(1, item.value.max_case_to_check - 1)
    }
  }
}

// Fonction pour créer un item avec son format de réponse et ses modalités
const createItem = async () => {
  loading.value = true
  try {
    const res1 = await fetch(`${API_V1_URL}/format-reponses`, {
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
      notify("Erreur lors de la création du format de réponse", 'error')
      return
    }

    const data1 = await res1.json()
    console.log("FormatReponse créé:", data1)

    const res2 = await fetch(`${API_V1_URL}/items`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        format_reponse_id: data1.formatReponse.id,
        question: item.value.question,
        nom_court: item.value.nom_court,
        min_case_to_check: isQCM.value ?  item.value.min_case_to_check : null,
        max_case_to_check: isQCM.value ? item.value.max_case_to_check : null,
        obligatoire: item.value.obligatoire,
      })
    })

    if (!res2.ok) {
      notify("Erreur lors de la création de l'item", 'error')
      return
    }

    const data2 = await res2.json()
    console.log("Item créé:", data2)

    if (isQCMorQCU.value) {
      for (const modalite of modalites.value) {
        const resModalite = await fetch(`${API_V1_URL}/modalite-reponses`, {
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
            min_value: null,
            max_value: null
          })
        })

        if (!resModalite.ok) {
          notify("Erreur lors de la création des modalités", 'error')
          return
        }
      }
      console.log("Modalités QCM/QCU créées")
    } else if (isEVN.value) {
      const res3 = await fetch(`${API_V1_URL}/modalite-reponses`, {
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
          min_value: modaliteEVN.value.min_value,
          max_value: modaliteEVN.value.max_value
        })
      })

      if (!res3.ok) {
        notify("Erreur lors de la création de la modalité EVN", 'error')
        return
      }

      const data3 = await res3.json()
      console.log("Modalité EVN créée:", data3)
    }

    createdItemId.value = data2.item.id
    valueItemQuestionCreated.value = item.value.question

    showPopup.value = true

  } catch (err) {
    console.error("Erreur :", err)
    notify("Erreur: " + err, 'error')
  } finally {
    loading.value = false
    item.value = { question: '', nom_court: '', obligatoire: false, min_case_to_check: null, max_case_to_check: null }
    formatReponse.value = { type: '' }
    modalites.value = [{ intitule: '' }, { intitule: '' }]
    modaliteEVN.value = { min_value: '', max_value: '' }
  }
}

</script>

<template>
  <div class="form-wrapper">
    <div class="form-card">
      <form @submit.prevent="createItem">
        <div class="form-group">
          <label>*Type de réponse :</label>
          <select v-model="formatReponse.type" required>
            <option value="">--- Choisir un type ---</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>*Question :</label>
          <input type="text" v-model="item.question" placeholder="Entrez la question" maxlength="300" required>
          <p>{{ item.question.length }}/300</p>

          <label>*Nom court :</label>
          <input type="text" v-model="item.nom_court" placeholder="Entrez le nom de la variable" maxlength="30" required>
          <p>{{ item.nom_court.length }}/30</p>
        </div>

        <div class="form-group radio-group">
          <label>*Obligatoire :</label>
          <div class="radio-wrapper">
            <input type="radio" id="obligatoire-oui" :value="true" v-model="item.obligatoire" />
            <label for="obligatoire-oui" class="radio-label">OUI</label>
            <input type="radio" id="obligatoire-non" :value="false" v-model="item.obligatoire" />
            <label for="obligatoire-non" class="radio-label">NON</label>
          </div>
        </div>

        <div v-if="isQCMorQCU" class="modalites-section">
          <h3>*Modalités de réponse (minimum 2, maximum 20)</h3>
          <div v-for="(modalite, index) in modalites" :key="index" class="modalite-item">
            <input 
              type="text" 
              v-model="modalite.intitule" 
              :placeholder="'Intitulé ' + (index + 1)" 
              required
              maxlength="255"
            >
            <p>{{ modalite.intitule?.length }}/255</p>
            <button 
              type="button" 
              @click="removeModalite(index)"
              :disabled="modalites.length <= 2"
              class="btn-remove"
            >
              X
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

          <!-- Section min/max uniquement pour QCM -->
          <div v-if="isQCM" class="qcm-cases-section">
            <h4>*Nombre de cases à cocher</h4>
            <div class="cases-row">
              <div class="form-group">
                <label>*Minimum :</label>
                <select v-model="item.min_case_to_check" required>
                  <option :value="null">-- Choisir --</option>
                  <option v-for="n in minCaseOptions" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>*Maximum :</label>
                <select
                  v-model="item.max_case_to_check"
                  required
                  :disabled="item.min_case_to_check === null"
                >
                  <option :value="null">-- Choisir --</option>
                  <option v-for="n in maxCaseOptions" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>
            <p class="cases-hint">
              Le maximum ne peut pas dépasser le nombre de modalités ({{ modalites.length }}).
              Le minimum doit être au moins 1.
            </p>
          </div>
        </div>

        <div v-if="isEVN" class="evn-section">
          <h3>*Valeurs de l'échelle</h3>
          <div class="form-group">
            <label>*Valeur minimale :</label>
            <input type="text" v-model="modaliteEVN.min_value" placeholder="Ex: bien" required maxlength="150">
            <p>{{ modaliteEVN.min_value?.length }}/150</p>
          </div>
          <div class="form-group">
            <label>*Valeur maximale :</label>
            <input type="text" v-model="modaliteEVN.max_value" placeholder="Ex: très bien" required maxlength="150">
            <p>{{ modaliteEVN.max_value?.length }}/150</p>
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

    <PopupAddItemCreateToBank
      v-if="showPopup"
      :item-id="createdItemId"
      :item-question="valueItemQuestionCreated"
      @close="showPopup = false"
      @validated="showPopup = false"
    />
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

.radio-group {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-wrapper input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-label {
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

.qcm-cases-section {
  margin-top: 20px;
  padding: 16px;
  background-color: #eef4ff;
  border-radius: 8px;
  border: 1px solid #b3ceff;
}

.qcm-cases-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.cases-row {
  display: flex;
  gap: 20px;
}

.cases-row .form-group {
  flex: 1;
}

.cases-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
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