<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

interface EnqueteData {
    id?: string
    title: string
    url_enquete: string
    archived: boolean
}

const enquetes = ref<EnqueteData[]>([])
const currentPage = ref(1)
const itemsPerPage = 10
const storeAuth = useAuthStore()

const paginatedEnquetes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return enquetes.value.slice(start, end);
});

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum;
};

const getAllEnquetes = async() => {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/enquetes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storeAuth.token}`,
            },
        })
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }
        const data = await response.json()
        enquetes.value = data
    } catch (error) {
        console.error('Error:', error)
    }
   
}

onMounted(() => {
    getAllEnquetes()
})
</script>

<template scoped>
  <div>
    <h1>Gestion des Enquetes</h1>
    <ul>
      <li v-for="enquete in paginatedEnquetes" :key="enquete.id">
        <p>Title :{{ enquete.title }}</p>
        <p>URL :{{ enquete.url_enquete }}</p>
        <p>Archivé :{{ enquete.archived }}</p>
      </li>
    </ul>
    <Paginate
      :page-count="Math.ceil(enquetes.length / itemsPerPage)"
      :click-handler="handlePageChange"
      :prev-text="'Prev'"
      :next-text="'Next'"
      :container-class="'pagination'"
      :page-class="'page-item'"
    />
  </div>
</template>

<style scoped>
</style>