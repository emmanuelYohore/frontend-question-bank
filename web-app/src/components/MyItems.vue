<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, watch } from 'vue'
import NavigationBar from './NavigationBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  getAllItemForUser()
})

interface Item {
  id: string
  question: string
  obligatoire: boolean
  archived: boolean
}

const storeAuth = useAuthStore()
const items = ref<Item[]>([])
const userId = storeAuth.userId
const loading = ref(true)
const input = ref('')

//fonction pour récupérer tous les items avec leurs items associés pour un userId
const getAllItemForUser = async () => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      items.value = data
      loading.value = false
    })
    .catch(error => console.error('Error:', error))
}

// filtre tous les items
const filterItems = async () => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/items?search=${input.value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      items.value = data
      loading.value = false
    })
    .catch(error => console.error('Error:', error))
}

watch(input, () => {  
      filterItems()
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
      <h2 class="page-title">Mes items</h2>
      <input type="text" v-model="input" placeholder="Chercher un item" />

      <p class="page-subtitle">Cliquez sur un item pour voir ses détails</p>

      <div v-if="loading" class="loading">
        <p>Chargement...</p>
      </div>

      <div v-else>
        <div v-if="items.length === 0" class="empty-state">
          <p>Pas d'items</p>
        </div>

        <div v-else class="items-container">
          <router-link
            v-for="item in items"
            :key="item.id"
            :to="`/item/${item.id}`"
            class="item-card"
          >
            <span class="card-name" :title="item.question">
              {{ item.question }}
            </span>
            <span class="item-status" :class="{ 'non': !item.archived }">
              Archivé : {{ item.archived ? 'oui' : 'non' }}
            </span>
          </router-link>
        </div>

        <div class="actions">
          <router-link to="/create-item" class="btn-create">+ Créer un item</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
 * {
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

.items-container {
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

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 145px;
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

.item-card:hover {
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

.item-status {
  font-size: 0.85rem;
  font-weight: 500;
  color: #27ae60;
}

.item-status.non {
  color: #95a5a6;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-create {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #5b9bd5;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-create:hover {
  background-color: #4a8bc4;
}
</style>
