<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
// import Paginate from "vuejs-paginate-next";

interface ItemData {
    id: string
  question: string
  obligatoire: boolean
  archived: boolean
}

const items = ref<ItemData[]>([])
const currentPage = ref(1)
const itemsPerPage = 10
const storeAuth = useAuthStore()

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return items.value.slice(start, end);
});

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum;
};

const getAllItems = async() => {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/items`, {
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
        items.value = data
    } catch (error) {
        console.error('Error:', error)
    }
   
}

onMounted(() => {
    getAllItems()
})
</script>

<template scoped>
  <div>
    <h1>Gestion des Items</h1>
    <ul>
      <li v-for="item in paginatedData" :key="item.id">
        <p>Question :{{ item.question }}</p>
        <p>Obligatoire :{{ item.obligatoire }}</p>
        <p>Archivé :{{ item.archived }}</p>
      </li>
    </ul>
    <Paginate
      :page-count="Math.ceil(items.length / itemsPerPage)"
      :click-handler="handlePageChange"
      :prev-text="'Prev'"
      :next-text="'Next'"
      :container-class="'pagination'"
      :page-class="'page-item'"
    />
  </div>
</template>

<style scoped>
@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.page-item {
  padding: 10px 15px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.page-item:hover {
  background-color: #f0f0f0;
}
.active-page {
  background-color: #007bff;
  color: #fff;
}
</style>