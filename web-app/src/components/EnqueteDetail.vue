<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()


interface BankItem {
  id: number
  name: string
  archiver: boolean
 
}

interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  url_enquete?: string;
  archiver: boolean;
}

const bankItems = ref<BankItem[]>([])

const enquete = ref<Enquete | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const enqueteId = route.params.enqueteId

const getEnqueteDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'enquête')
    }
    
    const data = await response.json()
    enquete.value = data
    bankItems.value = data.bank_items
    console.log(`enquete : ${enquete.value}`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const deleteEnquete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette enquête ?')) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (response.ok) {
      router.push('/my-enquetes')
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Erreur lors de la suppression')
  }
}

const toggleArchive = async () => {
  if (!enquete.value) return
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        archiver: !enquete.value.archiver
      })
    })
    
    if (response.ok) {
      await getEnqueteDetail()
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Erreur lors de la mise à jour')
  }
}

const goBack = () => {
  router.push('/my-enquetes')
}

onMounted(() => {
  getEnqueteDetail()
})
</script>

<template>
  <div class="enquete-detail">
    <h1>Détails de l'Enquête</h1>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="goBack">Retour</button>
    </div>

    <div v-else-if="enquete" class="content">
      <div class="details-card">
        <h2>{{ enquete.title }}</h2>
        
        <div class="info-section">
          <p><strong>Propriétaire:</strong>{{ storeAuth.user?.surname }}</p>
                        <p><strong>Titre:</strong>{{ enquete.title }}</p>

              <p><strong>Description:</strong>{{ enquete.description }}</p>
              <p><strong>Message de début:</strong>{{ enquete.start_message }}</p>
              <p><strong>Message de fin:</strong>{{ enquete.end_message }}</p>
            <p><strong>URL:</strong>{{ enquete?.url_enquete }}</p>


          <p>
            <strong>Statut:</strong> 
            <span :class="{ 'archived': enquete.archiver, 'active': !enquete.archiver }">
              {{ enquete.archiver ? 'Archivée' : 'Active' }}
            </span>
          </p>
          
        </div>

        <div class="actions">
          <button @click="toggleArchive" class="btn-archive">
            {{ enquete.archiver ? 'Désarchiver' : 'Archiver' }}
          </button>
          <button @click="deleteEnquete" class="btn-delete">
            Supprimer
          </button>
          <button @click="goBack" class="btn-back">
            Retour
          </button>
        </div>
      </div>
    </div>
  </div>

  <div>
   
     <div v-if="bankItems.length == 0" class="empty-state">
      <p>Pas de banque ajoutés</p>
    </div>

    <div v-else class="bank-items-container">
       <h1>banques ajoutés</h1>
      <div v-for="bank in bankItems" :key="bank.id" class="bank-item-card">
        <router-link :to="`/bank-item/${bank.id}`" class="bank-item-link">
          <h3>{{ bank.name }}</h3>
            <p class="bank-status" :class="{ archived: bank.archiver }">
                {{ bank.archiver ? "Archivée" : "Active" }}
            </p>
        </router-link>
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