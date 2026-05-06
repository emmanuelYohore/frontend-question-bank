<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, watch } from 'vue'
import NavigationBar from './NavigationBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  getAllBankForUser()
})

interface BankItem {
  id: string
  user_id: string
  name: string
  archived: boolean
}

const storeAuth = useAuthStore()
const bankItems = ref<BankItem[]>([])
const userId = storeAuth.user?.id
const loading = ref(true)
const input = ref('')

//fonction pour récupérer tous les bank items avec leurs items associés pour un userId
const getAllBankForUser = async () => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      bankItems.value = data
      loading.value = false
    })
    .catch(error => console.error('Error:', error))
}

// filtre tous les bank items
const filterBanks = async () => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items?search=${input.value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      bankItems.value = data
      loading.value = false
    })
    .catch(error => console.error('Error:', error))
}


watch(input, () => {  
      filterBanks()
  })
</script>

<template>
  <navigation-bar />
  <div class="page-wrapper">
    <div class="back-row">
      <button class="back-btn" @click="router.back()">
        <span class="back-circle">&#8592;</span>
        Retour
      </button>
    </div>

    <div class="content">
      <h2 class="page-title">Mes banques</h2>
      <h2>Nombre de banques : {{bankItems.length}} / 50</h2>
      <input type="text" v-model="input" placeholder="Chercher une banque" />

      <p class="page-subtitle">Cliquez sur une banque pour voir ses détails</p>

      <div v-if="loading" class="loading">
        <p>Chargement...</p>
      </div>

      <div v-else>
        <div v-if="bankItems.length === 0" class="empty-state">
          <p>Pas de banques</p>
        </div>

        <div v-else class="bank-items-container">
          
             <router-link
              v-for="bankItem in bankItems"
              :key="bankItem.id"
              :to="`/bank-item/${bankItem.id}`"
              class="bank-item-card"
            >
              <span class="card-name" :title="bankItem.name">
                {{ bankItem.name }}
              </span>
              <span class="bank-status" :class="{ archived: bankItem.archived }">
                {{ bankItem.archived ? 'Archivée' : 'Active' }}
              </span>
            </router-link>
       
         
        </div>

        <div class="actions">
          <router-link to="/create-bank-item" class="btn-create">+ Créer une banque</router-link>
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

 input[type="text"] {
  width: 50%;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 15px;
}

.page-wrapper {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.back-row {
  margin-bottom: 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #2c3e50;
  padding: 0;
}

.back-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 2px solid #2c3e50;
  border-radius: 50%;
  font-size: 1.1rem;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.4rem 0;
}

.page-subtitle {
  color: #555;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-state {
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.bank-items-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2.5rem;
  max-width: 1200px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #f9f9f9;
}

.bank-item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 130px;
  padding: 1rem 0.75rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease;
  gap: 0.35rem;
}

.bank-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.13);
}

.card-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.bank-status {
  font-size: 0.85rem;
  font-weight: 500;
  color: #27ae60;
}

.bank-status.archived {
  color: #95a5a6;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-create {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-create:hover {
  background-color: #2980b9;
}
</style>
