<script setup lang="ts">
import PopupUpdateRoleUser from '@/modals/PopupUpdateRoleUser.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref, watch } from 'vue'

interface UserData {
  id: string
  name: string
  surname: string
  email: string
  role: string
}

const users = ref<UserData[]>([])
const user = ref<UserData>()
const currentPage = ref(1)
const itemsPerPage = 8
const showPopupRole = ref(false)
const loading = ref(false)
const storeAuth = useAuthStore()
const input = ref('')


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

const confirmPopupRole = async (newRole: string) => {
  if (!user.value) return

  loading.value = true

  await fetch(`http://localhost:8000/api/v1/users/${user.value.id}`, {
    method: 'PUT',
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${storeAuth.token}`,
    },
    body: JSON.stringify({ role: newRole }),
  })
    .then(res => res.json())
    .then(() => {
      user.value!.role = newRole
      showPopupRole.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false)
}

const filterUsers = async () => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/users?search=${input.value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      users.value = data
    })
    .catch(error => console.error('Error:', error))
    .finally(() => loading.value = false)
}

const openPopup = (selectedUser: UserData) => {
  user.value = selectedUser
  showPopupRole.value = true
}

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return users.value.slice(start, end);
});

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum;
};

watch(input, () => {  
      filterUsers()
})

onMounted(() => {
    getAllUsers()
})
</script>

<template scoped>
  <div>
    <h1>Gestion des Utilisateurs</h1>
    <input type="text" v-model="input" placeholder="Chercher un utilisateur par (email, nom, prénom)" />

    <div v-if="loading" class="loading">
        <p>Chargement...</p>
    </div>
    
    <div v-else>
      <p v-if="users.length === 0">Aucun utilisateur trouvé.</p>
      <p v-else>Nombre d'utilisateurs : {{ users.length }}</p>

      <ul>
      <li v-for="user in paginatedUsers" :key="user.id">
        <p>Nom :{{ user.name }}</p>
        <p>Prénom :{{ user.surname }}</p>
        <p>Email :{{ user.email }}</p>
        <p>Role :{{ user.role }} </p>
        <button class="modify-button" @click="openPopup(user)">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
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
     <PopupUpdateRoleUser
        v-if="showPopupRole"
        :current-role="user?.role || ''"
        @confirm="confirmPopupRole"
        @cancel="showPopupRole = false"
      />
    </div>
    
  </div>
</template>

<style scoped>
.modify-button {
  align-items: center;
  gap: 0.9rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #1f2937;
  font-size: 0.95rem;
  padding: 0.25rem 0;
  white-space: nowrap;
}
</style>