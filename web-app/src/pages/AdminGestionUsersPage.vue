<script setup lang="ts">
import PopupUpdateRoleUser from '@/modals/PopupUpdateRoleUser.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface UserData {
  id: string
  name: string
  surname: string
  email: string
  role: string
}

const users = ref<UserData[]>([])
const user = ref<UserData>()
const router = useRouter()

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
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        users.value = await response.json()
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
    .then(data => { users.value = data })
    .catch(error => console.error('Error:', error))
    .finally(() => loading.value = false)
}

const openPopup = (selectedUser: UserData) => {
  user.value = selectedUser
  showPopupRole.value = true
}

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return users.value.slice(start, start + itemsPerPage)
})

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum
}

watch(input, () => filterUsers())
onMounted(() => getAllUsers())
</script>

<template>
  <div class="page">
    <button class="back-btn" @click="router.back()">
        <span class="back-circle">&#8592;</span>
        Retour
      </button>
    <h1 class="page-title">Gestion des Utilisateurs</h1>

    <div class="search-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        class="search-input"
        type="text"
        v-model="input"
        placeholder="Chercher un utilisateur par (email, nom, prénom)"
      />
    </div>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else>
      <p v-if="users.length === 0" class="empty-state">Aucun utilisateur trouvé.</p>
      <p v-else class="user-count">Nombre d'utilisateurs : {{ users.length }}</p>

      <ul class="user-list">
        <li class="user-card" v-for="u in paginatedUsers" :key="u.id">
          <div class="user-info">
            <div class="user-row"><span class="label">Nom :</span><span class="value">{{ u.name }}</span></div>
            <div class="user-row"><span class="label">Prénom :</span><span class="value">{{ u.surname }}</span></div>
            <div class="user-row"><span class="label">Email :</span><span class="value">{{ u.email }}</span></div>
            <div class="user-row">
              <span class="label">Rôle :</span>
              <span class="value">{{ u.role }}</span>
              <button class="modify-button" @click="openPopup(u)" title="Modifier le rôle">
                <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>

      <Paginate
        :page-count="Math.ceil(users.length / itemsPerPage)"
        :click-handler="handlePageChange"
        :prev-text="'← Previous'"
        :next-text="'Next →'"
        :container-class="'pagination'"
        :page-class="'page-item'"
        :active-class="'active'"
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
*{
  font-family:  'Arial', sans-serif;
}
.page {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Arial', sans-serif;
  color: #1f2937;
}

.page-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

/* Search */
.search-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1.25rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.95rem;
  color: #374151;
  background: #f9fafb;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #6b7280;
  background: #fff;
}

/* User list */
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  background: #ffffff;
  border: 3px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
}

.label {
  font-weight: 700;
  min-width: 70px;
  color: #111827;
}

.value {
  color: #374151;
}

/* Edit button */
.modify-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  margin-left: 0.5rem;
  color: #374151;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}

.modify-button:hover {
  color: #111827;
  background: #f3f4f6;
}

.edit-icon {
  width: 18px;
  height: 18px;
}

.back-circle {
  width: 2.35rem;
  height: 2.35rem;
  border: 2px solid #1f2937;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #1f2937;
  font-size: 1rem;
}

/* States */
.loading,
.empty-state,
.user-count {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

/* Pagination — styles globaux nécessaires car Paginate génère des éléments hors du scope scoped */
</style>

<!-- Pagination: styles globaux pour vue-paginate -->
<style>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
}

.page-item a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}

.page-item a:hover {
  background: #f3f4f6;
}

.page-item.active a {
  background: #111827;
  color: #fff;
  font-weight: 600;
}

.page-item.disabled a {
  color: #d1d5db;
  cursor: default;
  pointer-events: none;
}
</style>