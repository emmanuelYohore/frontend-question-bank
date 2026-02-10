<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

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
  obligatoire : boolean 
}

interface ModaliteReponse {
  intitule?: string | null
  v1?: string | null
  v2?: string | null
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

const getItemDetail = async () => {
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
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const deleteItem = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/items/${itemId}`, {
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
    alert('Erreur lors de la suppression')
  }
}

const toggleObligatoire = async () => {
  if (!item.value) return
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/items/${itemId}`, {
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
      await getItemDetail()
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Erreur lors de la mise à jour')
  }
}

const goBack = () => {
  router.push('/my-items')
}

onMounted(() => {
  getItemDetail()
})
</script>

<template>
  <div class="bank-item-detail">
    <h1>Détails d'Items</h1>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goBack">Retour</button>
    </div>

    <div v-else-if="item" class="content">
      <div class="details-card">
        <h2>{{ item.question }}</h2>
        
        <div class="info-section">
          <p><strong>Propriétaire:</strong>{{ storeAuth.user?.surname }}</p>
          <p>
            <strong>Obligatoire:</strong> 
            <span :class="{ 'Oui': item.obligatoire, 'Non': !item.obligatoire }">
              {{ item.obligatoire ? 'Oui' : 'Non' }}
            </span>
          </p>
          <p><strong>Type de format de reponse :</strong>{{ formatReponse?.type}}</p>
          
            <div v-if="isQCMorQCU">
                <p><strong>Modalités :</strong></p>
                <ul v-for="(modalite, index) in modalites" :key="index">
                        <li>{{ modalite.intitule }}</li>
                </ul>
            </div>
            <div v-else-if="isEVN">
                <p><strong>Modalités :</strong></p>
                <div v-for="(modalite, index) in modalites" :key="index">
                        <p>{{ modalite.v1 }}</p>
                        <p>{{ modalite.v2 }}</p>
                </div>
            </div>
            <div v-else>
                <p><strong>Pas de modalités </strong></p>
            </div>
                
                    
                    
                
        </div>

        <div class="actions">
          <button @click="toggleObligatoire" class="btn-archive">
             {{ item.obligatoire ? 'Ne pas Rendre Obligatoire' : 'Rendre Obligatoire' }}
          </button>
          <button @click="deleteItem" class="btn-delete">
            Supprimer
          </button>
          <button @click="goBack" class="btn-back">
            Retour
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bank-item-detail {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
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

.details-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.details-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #34495e;
  font-size: 1.8rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section p {
  margin: 0.75rem 0;
  font-size: 1rem;
  line-height: 1.6;
}

.info-section strong {
  color: #2c3e50;
  margin-right: 0.5rem;
}

.archived {
  color: #95a5a6;
  font-weight: 500;
}

.active {
  color: #27ae60;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
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

.btn-back {
  background-color: #95a5a6;
  color: white;
}

.btn-back:hover {
  background-color: #7f8c8d;
}
</style>