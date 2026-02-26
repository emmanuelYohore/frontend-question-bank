<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'


onMounted(() => {
  getAllBankForUser()
})

interface BankItem {
  id: number
  user_id: number
  name: string
  archiver: boolean
}

const storeAuth = useAuthStore()
const bankItems = ref<BankItem[]>([])
const userId = storeAuth.user?.id
const loading = ref(true)

const getAllBankForUser = async () => {  
    
  loading.value = true
await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`,{
  
  method: "GET",
  headers:{
    "Content-Type": "application/json",
   'Authorization': `Bearer ${storeAuth.token}`,
  },
})
.then(response => response.json())
.then(data => {
  console.log(data)
  bankItems.value = data
  loading.value = false

  console.log(bankItems.value)
 
})
.catch(error => console.error('Error:', error))
}

</script>

<template>
  <div class="my-bank-items">
    <h1>Mes banques</h1>

     <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-if="bankItems.length == 0" class="empty-state">
      <p>Pas de banques</p>
      <router-link to="/create-bank-item" class="btn-create">Créer une banque d'items</router-link>
    </div>

    <div v-else class="bank-items-container">
      <div v-for="bankItem in bankItems" :key="bankItem.id" class="bank-item-card">
        <router-link :to="`/bank-item/${bankItem.id}`" class="bank-item-link">
          <h3>{{ bankItem.name }}</h3>
          <p class="bank-status" :class="{ 'archived': bankItem.archiver }">
            {{ bankItem.archiver ? 'Archivée' : 'Active' }}
          </p>
        </router-link>
      </div>

      <div class="actions">
        <router-link to="/create-bank-item" class="btn-create">+ Créer une banque d'items</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-bank-items {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.empty-state p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.bank-items-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.bank-item-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.bank-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bank-item-link {
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.bank-item-link h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.bank-status {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.bank-status.archived {
  color: #95a5a6;
}

.bank-status:not(.archived) {
  color: #27ae60;
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding-top: 1rem;
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
