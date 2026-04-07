<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import PopupUpdateModalite from '@/modals/PopupUpdateModalite.vue'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

interface FormatReponse {
  id?: number 
  type: string
}

interface Item {
  id?: number
  question: string
  obligatoire: boolean 
}

interface ModaliteReponse {
  id: number
  intitule?: string | null
  v1?: string | null
  v2?: string | null
}

const item = ref<Item | null>(null)
const formatReponse = ref<FormatReponse | null>(null)
const modalites = ref<ModaliteReponse[]>([])
const modaliteToUpdate = ref<ModaliteReponse | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)

const itemId = route.params.itemId

const isQCMorQCU = computed(() => 
   formatReponse.value?.type === 'qcm' || formatReponse.value?.type === 'qcu'
)
const isEVN = computed(() => formatReponse.value?.type === 'evn')

const showModal = ref(false)

const onConfirm = async (newModalite: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteToUpdate.value?.id}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ intitule: newModalite }),
  })
    .then(res => res.json())
    .then(() => {
      getModalites()
      showModal.value = false
    })
    .catch(err => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

const getModalites = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/items/${itemId}`, {
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
    console.log(modalites)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const removeModalite = async (modaliteId: number) => {
  if (!confirm("Etes-vous sur de vouloir supprimer cette modalité ?")) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/modalite-reponses/${modaliteId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la modalité')
    }

    await getModalites()
  } catch (err) {
    console.error('Error:', err)
    alert('Impossible de supprimer la modalité')
  }
}

const goBack = () => {
  router.push({ name: 'item-detail', params: { itemId: itemId } })
}

onMounted(() => {
  getModalites()
})
</script>

<template>
  <div class="modalite-item-page">
    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goBack">Retour</button>
    </div>

    <div v-else-if="item" class="content">
      <div class="header">
        <button @click="goBack" class="btn-back">
          <span class="arrow">←</span>
        </button>
        <span class="header-text">Retour</span>
      </div>

      <h1 class="page-title">Modalités de l'item</h1>

      <div v-if="isQCMorQCU && modalites.length > 0" class="modalites-list">
        <ul>
          <li v-for="(modalite, index) in modalites" :key="index">
            - {{ modalite.intitule }}
            				<button class="icon-btn" @click="removeModalite(modalite.id)">✕</button>
                    <button class="icon-btn" @click="modaliteToUpdate = modalite; showModal = true">✎</button>
                    <PopupUpdateModalite
                    v-if="showModal"
                    :current-modalite="modaliteToUpdate?.intitule || ''"
                    @confirm="onConfirm"
                    @cancel="showModal = false"
                    />
          </li>
          
        </ul>
      </div>

      <div v-else-if="isEVN && modalites.length > 0" class="modalites-list">
        <ul>
          <li v-for="(modalite, index) in modalites" :key="index">

            <p>- Valeur 1: {{ modalite.v1 }}</p>

            <button class="icon-btn" @click="removeModalite(modalite.id)">✕</button>
              
             <p>- Valeur 2: {{ modalite.v2 }}</p>
            
              <button class="icon-btn" @click="removeModalite(modalite.id)">✕</button>

            

          </li>
        </ul>
      </div>

      <div v-else class="no-modalites">
        <p>Pas de modalités disponibles</p>
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

.modalite-item-page {
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

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-back {
  background: white;
  border: 2px solid #000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
}

.btn-back:hover {
  background-color: #f5f5f5;
}

.arrow {
  font-size: 1.2rem;
  color: #000;
  font-weight: bold;
}

.header-text {
  font-size: 1rem;
  color: #000;
  font-weight: 500;
}

.page-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 2rem;
  color: #000;
}

.modalites-list ul {
  list-style-position: inside;
  padding-left: 1rem;
}

.modalites-list li {
  margin-bottom: 0.8rem;
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
}

.no-modalites {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>