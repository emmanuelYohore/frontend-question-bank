<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import PopupUpdateQuestionItem from '../modals/PopupUpdateQuestionItem.vue'
import PopupUpdateNomCourt from '@/modals/PopupUpdateNomCourt.vue'
import { notify } from '@/utils/popup'
import { API_V1_URL } from '@/config/api'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

interface FormatReponse {
  id?: string 
  type: string
}

interface ModaliteReponse {
  id?: string
  intitule?: string | null
  min_value?: string | null
  max_value?: string | null
  format_reponse?: FormatReponse
}

interface Item {
  id?: string
  question: string
  obligatoire : boolean
  nom_court: string
  archived: boolean
  format_reponse?: FormatReponse | null
  modalite_reponses?: ModaliteReponse[]
}

const item = ref<Item | null>(null)
const formatReponse = ref<FormatReponse | null>(null)
const modalites = ref<ModaliteReponse[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const itemId = route.params.itemId

const isQCMorQCU = computed(() => 
   formatReponse.value?.type === 'qcm' || formatReponse.value?.type === 'qcu'
 )
const isEVN = computed(() => formatReponse.value?.type === 'evn')
 //const isTexte = computed(() => formatReponse.value?.type === 'texte')


const showModalQuestion = ref(false)
const nom_court = ref(false)


const onConfirmUpdateQuestion = async (newQuestion: string) => {
  loading.value = true

  await fetch(`${API_V1_URL}/items/${itemId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ question: newQuestion }),
  })
    .then(res => res.json())
    .then(() => {
      if (item.value) {
        item.value.question = newQuestion
      }
      showModalQuestion.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

const onConfirmUpdateNomCourt = async (newNomCourt: string) => {
  loading.value = true

  await fetch(`${API_V1_URL}/items/${itemId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ nom_court: newNomCourt }),
  })
    .then(res => res.json())
    .then(() => {
      if (item.value) {
        item.value.nom_court = newNomCourt
      }
      nom_court.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

const toggleArchiveItem = async () => {
  loading.value = true
  if (!item.value) return
  
  try {
    const response = await fetch(`${API_V1_URL}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        archived: !item.value.archived
      })
    })
    
    if (response.ok) {
      await getItemDetailWithModalitesAndFormatReponse()
      loading.value = false
    }
  } catch (err) {
    console.error('Error:', err)
    loading.value = false
    notify('Erreur lors de la mise à jour', 'error')
  }
}


// Récupère les détails de l'item, son format de réponse et ses modalités
const getItemDetailWithModalitesAndFormatReponse = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`${API_V1_URL}/users/${storeAuth.userId}/items/${itemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'item')
    }
    
    const data = await response.json()
    item.value = data
    formatReponse.value = data.format_reponse
    modalites.value = data.modalite_reponses

    console.log(item)
    console.log(formatReponse)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Récupère tous les bank items avec leurs items associés pour un userId donné
const deleteItem = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
    return
  }
  
  try {
    const response = await fetch(`${API_V1_URL}/items/${itemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (response.ok) {
      router.push('/my-items')
    }
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors de la suppression', 'error')
  }
}

const toggleObligatoire = async () => {
  if (!item.value) return
  
  try {
    const response = await fetch(`${API_V1_URL}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        obligatoire: !item.value.obligatoire
      })
    })
    
    if (response.ok) {
      await getItemDetailWithModalitesAndFormatReponse()
    }
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors de la mise à jour', 'error')
  }
}

const goBack = () => {
  router.push('/my-items')
}

const goToModalites = () => {
  router.push({ name: 'item-modalites', params: { itemId: itemId } })
}

onMounted(() => {
  getItemDetailWithModalitesAndFormatReponse()
})
</script>

<template>
  <div class="bank-item-detail">
    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goBack">Retour</button>
    </div>

    <div v-else-if="item" class="content">
      <div class="header">
        <button @click="goBack" class="btn-back-header">
          <span class="arrow">←</span>
        </button>
        <span class="header-text">Retour</span>
        <h1 class="page-title">Détails d'items</h1>
      </div>

      <div class="details-card">
        
        <div class="info-section">
          
          <div class="info-group">
            <label>Question :</label>
            <span>{{ item.question }}</span>
            <button @click="showModalQuestion = true">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
            </button>

            <PopupUpdateQuestionItem
              v-if="showModalQuestion"
              :current-question="item.question"
              @confirm="onConfirmUpdateQuestion"
              @cancel="showModalQuestion = false"
            />
          </div>

          <div class="info-group">
            <label>Obligatoire :</label>
            <span>{{ item.obligatoire ? 'Oui' : 'Non' }}</span>
          </div>

          <div class="info-group">
            <label>Nom court :</label>
            <span>{{ item.nom_court }}</span>

            <button @click="nom_court = true">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
            </button>

            <PopupUpdateNomCourt
              v-if="nom_court"
              :current-nom-court="item.nom_court"
              @confirm="onConfirmUpdateNomCourt"
              @cancel="nom_court = false"
            />
          </div>
          

          <div class="info-group">
            <label>Type de format de reponse :</label>
            <span>{{ formatReponse?.type }}</span>
          </div>

          <div class="info-group">
            <label>Modalités :</label>
            <button v-if="isQCMorQCU || isEVN" @click="goToModalites" class="btn-see-modalites">
              Voir les modalités
            </button>
            <span v-else>Pas de modalités pour ce type de format de réponse</span>
          </div>
        </div>

        <div class="actions">
          <button @click="toggleArchiveItem" class="btn-archive">
          {{ item.archived ? 'Desarchiver' : 'Archiver' }}
        </button>
          <button @click="toggleObligatoire" class="btn-archive">
             {{ item.obligatoire ? 'Ne pas rendre obligatoire' : 'Rendre obligatoire' }}
          </button>
          <button @click="deleteItem" class="btn-delete">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.edit-icon {
  width: 1.9rem;
  height: 1.9rem;
}

.bank-item-detail {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

.content {
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.btn-back-header {
  background: white;
  border: 2px solid #000;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s;
}

.btn-back-header:hover {
  background-color: #f5f5f5;
}

.arrow {
  font-size: 1.3rem;
  color: #000;
  font-weight: bold;
}

.header-text {
  font-size: 0.95rem;
  color: #000;
  font-weight: 500;
  margin-right: auto;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.3rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.details-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.details-card h2 {
  margin: 0;
  color: #000;
  font-size: 1rem;
  font-weight: 400;
  flex: 1;
}

.btn-edit {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  flex-shrink: 0;
}

.info-section {
  margin-bottom: 2rem;
}

.info-group {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
  gap: 1rem;
}

.info-group label {
  font-weight: 600;
  color: #000;
  min-width: 200px;
  flex-shrink: 0;
}

.info-group span {
  color: #333;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.5;
}

.btn-see-modalites {
  background-color: #27ae60;
  color: white;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-see-modalites:hover {
  background-color: #229954;
}

.actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ddd;
  justify-content: center;
}

button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-archive {
  background-color: #3498db;
  color: white;
}

.btn-archive:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}
</style>