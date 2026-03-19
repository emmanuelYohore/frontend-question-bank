<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

onMounted(() => {
  getAllEnquetesForUser()
})

interface Enquete {
  id?: number
  title: string
  description: string
  start_message: string
  end_message: string
  archiver: boolean
}

const storeAuth = useAuthStore()
const enquetes = ref<Enquete[]>([])
const userId = storeAuth.user?.id
const loading = ref(true)

const getAllEnquetesForUser = async () => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/enquetes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      enquetes.value = data
      loading.value = false
    })
    .catch(error => console.error('Error:', error))
}
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
      <h2 class="page-title">Mes enquêtes</h2>
      <p class="page-subtitle">Cliquez sur une enquête pour voir ses détails</p>

      <div v-if="loading" class="loading">
        <p>Chargement...</p>
      </div>

      <div v-else>
        <div v-if="enquetes.length === 0" class="empty-state">
          <p>Pas d'enquêtes</p>
        </div>

        <div v-else class="enquetes-container">
          <router-link
            v-for="enquete in enquetes"
            :key="enquete.id"
            :to="`/enquete/${enquete.id}`"
            class="enquete-card"
          >
            <span class="card-name">{{ enquete.title }}</span>
            <span class="enquete-status" :class="{ archived: enquete.archiver }">
              {{ enquete.archiver ? 'Archivée' : 'Active' }}
            </span>
          </router-link>
        </div>

        <div class="actions">
          <router-link to="/create-enquete" class="btn-create">+ Créer une enquête</router-link>
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

.enquetes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.enquete-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  min-height: 74px;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease;
}

.enquete-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
}

.card-name {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  text-align: center;
}

.enquete-status {
  font-size: 0.85rem;
  font-weight: 500;
  color: #27ae60;
  text-align: center;
}

.enquete-status.archived {
  color: #95a5a6;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-create {
  display: inline-block;
  padding: 0.8rem 2.4rem;
  background-color: #5b8ee6;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-create:hover {
  background-color: #4a7fdb;
}
</style>
