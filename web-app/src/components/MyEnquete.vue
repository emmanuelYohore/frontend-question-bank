<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'

const router = useRouter()

onMounted(() => {
  getAllEnquetesForUser()
})

interface Enquete {
  id?: string
  title: string
  description: string
  start_message: string
  end_message: string
  archived: boolean
}

const storeAuth = useAuthStore()
const enquetes = ref<Enquete[]>([])
const currentPage = ref(1);
const itemsPerPage = 4
const userId = storeAuth.userId
const loading = ref(true)
const input = ref('')

//fonction pour récupérer tous les enquêtes avec leurs items associés pour un userId
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

const paginatedEnquetes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return enquetes.value.slice(start, end);
});

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum;
};
// filtre tous les enquêtes
const filterEnquetes = async () => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/enquetes?search=${input.value}`, {
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

watch(input, () => {
    filterEnquetes()
  
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
      <h2 class="page-title">Mes enquêtes</h2>
      <input type="text" v-model="input" placeholder="Chercher une enquête" />
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
            v-for="enquete in paginatedEnquetes"
            :key="enquete.id"
            :to="`/enquete/${enquete.id}`"
            class="enquete-card"
          >
            <span class="card-name" :title="enquete.title">
              {{ enquete.title }}
            </span>
            <span class="enquete-status" :class="{ archived: enquete.archived }">
              {{ enquete.archived ? 'Archiver' : 'Active' }}
            </span>
          </router-link>
          <paginate
      :page-count="Math.ceil(enquetes.length / itemsPerPage)"
      :click-handler="handlePageChange"
      :prev-text="'Précédent'"
      :next-text="'Suivant'"
      :container-class="'pagination'"
      :page-class="'page-item'"
    />
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

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 1.5rem 0;
  list-style: none;
  padding: 0;
}

:deep(.page-item a),
:deep(.page-item span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #555;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background 0.2s;
}

:deep(.page-item.active a),
:deep(.page-item.active span) {
  background-color: #2c3e50;
  color: #fff;
  font-weight: 700;
  border-radius: 6px;
}

:deep(.page-item a:hover) {
  background-color: #f0f0f0;
}

/* Search input */
input[type="text"] {
  width: 100%;
  max-width: 480px;
  padding: 0.75rem 1rem 0.75rem 2.8rem;
  margin: 1rem 0;
  border: none;
  border-radius: 12px;
  background-color: #f0f2f5;
  font-size: 0.95rem;
  color: #333;
  outline: none;
  display: block;
}

input[type="text"]:focus {
  background-color: #e8eaf0;
}

/* Layout */
.page-wrapper {
  max-width: 900px;
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
  width: 2.4rem;
  height: 2.4rem;
  border: 2px solid #2c3e50;
  border-radius: 50%;
  font-size: 1.2rem;
}

.page-title {
  font-size: 1.4rem;
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

/* Enquetes list */
.enquetes-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.enquete-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease;
  gap: 0.3rem;
  box-sizing: border-box;
}

.enquete-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.enquete-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #27ae60;
}

.enquete-status.archived {
  color: #95a5a6;
}

/* Actions */
.actions {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn-create {
  display: inline-block;
  padding: 0.85rem 2.5rem;
  background-color: #5b8ee6;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-create:hover {
  background-color: #4a7fdb;
}
</style>