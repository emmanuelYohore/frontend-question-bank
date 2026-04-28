<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import PopupUpdateModalite from '@/modals/PopupUpdateModalite.vue'
import PopupUpdateModaliteEvnV1 from '@/modals/PopupUpdateModaliteEvnV1.vue'
import PopupUpdateModaliteEvnV2 from '@/modals/PopupUpdateModaliteEvnV2.vue'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

interface FormatReponse {
  id?: string 
  type: string
}

interface ModaliteReponse {
  id: string
  intitule?: string | null
  v1?: string | null
  v2?: string | null
  format_reponse?: FormatReponse
}

interface Item {
  id?: string
  question: string
  obligatoire: boolean
  format_reponse?: FormatReponse | null
  modalite_reponses?: ModaliteReponse[]
}

const item = ref<Item | null>(null)
const formatReponse = ref<FormatReponse | null>(null)
const modalites = ref<ModaliteReponse[]>([])
const modaliteQcmOrQcuToUpdate = ref<ModaliteReponse | null>(null)
const modaliteEvnToUpdate = ref<ModaliteReponse | null>(null)


const loading = ref(true)
const error = ref<string | null>(null)

const itemId = route.params.itemId

const isQCMorQCU = computed(() => 
   formatReponse.value?.type === 'qcm' || formatReponse.value?.type === 'qcu'
)
const isEVN = computed(() => formatReponse.value?.type === 'evn')

const showModalQcmOrQcu = ref(false)
const showModalEvnV1 = ref(false)
const showModalEvnV2 = ref(false)

const onConfirmPopupQcmOrQcu = async (newModalite: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteQcmOrQcuToUpdate.value?.id}`, {
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
      showModalQcmOrQcu.value = false
    })
    .catch(err => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

const onConfirmPopupEvnV1 = async (newV1: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteEvnToUpdate.value?.id}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify(
      { 
        v1: newV1
      }
    ),
  })
    .then(res => res.json())
    .then(() => {
      getModalites()
      showModalEvnV1.value = false
    })
    .catch(err => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

const onConfirmPopupEvnV2 = async (newV2: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteEvnToUpdate.value?.id}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify(
      { 
        v2: newV2
      }
    ),
  })
    .then(res => res.json())
    .then(() => {
      getModalites()
      showModalEvnV2.value = false
    })
    .catch(err => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

// Récupère les modalités associées à l'item
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

const removeModalite = async (modaliteId: string) => {
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
                    <button class="icon-btn" @click="modaliteQcmOrQcuToUpdate = modalite; showModalQcmOrQcu = true">✎</button>
                    <PopupUpdateModalite
                    v-if="showModalQcmOrQcu"
                    :current-modalite="modaliteQcmOrQcuToUpdate?.intitule || ''"
                    @confirm="onConfirmPopupQcmOrQcu"
                    @cancel="showModalQcmOrQcu = false"
                    />
          </li>
          
        </ul>
      </div>

      <div v-else-if="isEVN && modalites.length > 0" class="modalites-list">
        <ul>
          <li v-for="(modaliteEvn, index) in modalites" :key="index">

            <p>- Valeur 1: {{ modaliteEvn.v1 }}</p>
                    <button class="icon-btn" @click="modaliteEvnToUpdate = modaliteEvn; showModalEvnV1 = true">✎</button>
                    <PopupUpdateModaliteEvnV1
                    v-if="showModalEvnV1"
                    :current-v1="modaliteEvnToUpdate?.v1 || ''"
                    @confirm="onConfirmPopupEvnV1"
                    @cancel="showModalEvnV1 = false"
                    />
                          
             <p>- Valeur 2: {{ modaliteEvn.v2 }}</p>

                    <button class="icon-btn" @click="modaliteEvnToUpdate = modaliteEvn; showModalEvnV2 = true">✎</button>
                    <PopupUpdateModaliteEvnV2
                    v-if="showModalEvnV2"
                    :current-v2="modaliteEvnToUpdate?.v2 || ''"
                    @confirm="onConfirmPopupEvnV2"
                    @cancel="showModalEvnV2 = false"
                    />                       
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