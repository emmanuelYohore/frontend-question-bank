<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { computed } from 'vue'
// import Paginate from "vuejs-paginate-next";

interface BankData {
    id: string
    name: string
    archived: boolean
}

const banks = ref<BankData[]>([])
const currentPage = ref(1)
const itemsPerPage = 10

const storeAuth = useAuthStore()

const getAllBanks = async() => {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/bank-items`, {
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
        banks.value = data
    } catch (error) {
        console.error('Error:', error)
    }
   
}

const paginatedBanks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return banks.value.slice(start, end);
});

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum;
};


onMounted(() => {
    getAllBanks()
})
</script>

<template scoped>
  <div>
    <h1>Gestion des Banks</h1>
    <ul>
      <li v-for="bank in paginatedBanks" :key="bank.id">
        <p>Nom :{{ bank.name }}</p>
        <p>Archivé :{{ bank.archived }}</p>
      </li>
    </ul>
    <Paginate
      :page-count="Math.ceil(banks.length / itemsPerPage)"
      :click-handler="handlePageChange"
      :prev-text="'Prev'"
      :next-text="'Next'"
      :container-class="'pagination'"
      :page-class="'page-item'"
    />
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
}
</style>