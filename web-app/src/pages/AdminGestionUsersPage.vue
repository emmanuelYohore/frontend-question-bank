<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

interface UserData {
  id: string
  name: string
  surname: string
  email: string
  role: string
}

const users = ref<UserData[]>([])
const currentPage = ref(1)
const itemsPerPage = 10

const storeAuth = useAuthStore()

const getAllUsers = async() => {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/users`, {
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
        users.value = data
    } catch (error) {
        console.error('Error:', error)
    }
   
}

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return users.value.slice(start, end);
});

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum;
};

onMounted(() => {
    getAllUsers()
})
</script>

<template scoped>
  <div>
    <h1>Gestion des Utilisateurs</h1>
    <ul>
      <li v-for="user in paginatedUsers" :key="user.id">
        <p>Nom :{{ user.name }}</p>
        <p>Prénom :{{ user.surname }}</p>
        <p>Email :{{ user.email }}</p>
        <p>Role :{{ user.role }}</p>
      </li>
    </ul>
    <Paginate
      :page-count="Math.ceil(users.length / itemsPerPage)"
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