<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'


onMounted(() => {
  getAllEnquetesForUser()
})

interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  archiver: boolean;
}

const storeAuth = useAuthStore()
const enquetes = ref<Enquete[]>([])
const userId = storeAuth.user?.id
const loading = ref(true)

const getAllEnquetesForUser = async () => {  
    
  loading.value = true
await fetch(`http://localhost:8000/api/v1/users/${userId}/enquetes`,{
  
  method: "GET",
  headers:{
    "Content-Type": "application/json",
   'Authorization': `Bearer ${storeAuth.token}`,
  },
})
.then(response => response.json())
.then(data => {
  console.log(data)
  enquetes.value = data
  loading.value = false

  console.log(enquetes.value)
 
})
.catch(error => console.error('Error:', error))
}

</script>

<template>
  <div class="my-enquetes">
    <h1>Mes enquêtes</h1>

     <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-if="enquetes.length == 0" class="empty-state">
      <p>Pas d'enquêtes</p>
      <router-link to="/create-enquete" class="btn-create">Créer une enquête</router-link>
    </div>

    <div v-else class="enquetes-container">
      <div v-for="enquete in enquetes" :key="enquete.id" class="enquete-card">
        <router-link :to="`/enquete/${enquete.id}`" class="enquete-link">
          <h3>{{ enquete.title }}</h3>
          <p class="enquete-description">{{ enquete.description }}</p>
          <p class="enquete-status" :class="{ 'archived': enquete.archiver }">
            {{ enquete.archiver ? 'Archivée' : 'Active' }}
          </p>
        </router-link>
      </div>

      <div class="actions">
        <router-link to="/create-enquete" class="btn-create">+ Créer une enquête</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-enquetes {
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

.enquetes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.enquete-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.enquete-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.enquete-link {
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.enquete-link h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.enquete-status {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.enquete-status.archived {
  color: #95a5a6;
}

.enquete-status:not(.archived) {
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
