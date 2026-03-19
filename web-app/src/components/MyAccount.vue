<script lang="ts" setup>
import { useAuthStore, type User } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavigationBar from './NavigationBar.vue'
import PopupUpdateUserInfo from './PopupUpdateUserInfo.vue'

const router = useRouter()
const storeAuth = useAuthStore()
const userId = storeAuth.user?.id
const loading = ref(false)
const user = ref<User | null>(null)

const showPopupName = ref(false)
const showPopupSurname = ref(false)
const showPopupEmail = ref(false)

onMounted(() => {
  getInfoUser()
})

const getInfoUser = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    user.value = await response.json()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const openPopupName = () => {
  showPopupName.value = true
}

const closePopupName = () => {
  showPopupName.value = false
}

const confirmPopupName = async (payload: { value: string }) => {
  if (!payload.value.trim()) return
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      }
      ,
      body: JSON.stringify({ name: payload.value }),
    })

    if (!response.ok) throw new Error()
    if (user.value) user.value.name = payload.value
    showPopupName.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

const openPopupSurname = () => {
  showPopupSurname.value = true
}

const closePopupSurname = () => {
  showPopupSurname.value = false
}

const confirmPopupSurname = async (payload: { value: string }) => {
  if (!payload.value.trim()) return
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      }
      ,
      body: JSON.stringify({ surname: payload.value }),
    })

    if (!response.ok) throw new Error()
    if (user.value) user.value.surname = payload.value
    showPopupSurname.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

const openPopupEmail = () => {
  showPopupEmail.value = true
}

const closePopupEmail = () => {
  showPopupEmail.value = false
}

const confirmPopupEmail = async (payload: { value: string }) => {
  if (!payload.value.trim()) return
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      }
      ,
      body: JSON.stringify({ email: payload.value }),
    })

    if (!response.ok) throw new Error()
    if (user.value) user.value.email = payload.value
    showPopupEmail.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="my-account-container">
    <navigation-bar />

    <div class="page-wrapper">
      <div class="header-row">
        <button class="back-button" @click="goBack">
          <span class="back-circle">&#8592;</span>
          <span>Retour</span>
        </button>

        <h1 class="page-title">Mon compte</h1>
      </div>

      <div v-if="loading" class="loading">
        <p>Chargement...</p>
      </div>

      <div v-else class="account-card">
        <div class="info-row">
          <div class="info-main">
            <span class="label">Nom :</span>
            <span class="value">{{ user?.name }}</span>
          </div>
          <button class="modify-button" @click="openPopupName">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
        </div>

        <div class="info-row">
          <div class="info-main">
            <span class="label">Prénom :</span>
            <span class="value">{{ user?.surname }}</span>
          </div>
          <button class="modify-button" @click="openPopupSurname">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
        </div>

        <div class="info-row">
          <div class="info-main">
            <span class="label">Email :</span>
            <span class="value">{{ user?.email }}</span>
          </div>
          <button class="modify-button" @click="openPopupEmail">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
        </div>
      </div>
    </div>

    <PopupUpdateUserInfo
      :visible="showPopupName"
      title="Modifier le nom"
      :value="user?.name || ''"
      @close="closePopupName"
      @confirm="confirmPopupName"
    />

    <PopupUpdateUserInfo
      :visible="showPopupSurname"
      title="Modifier le prénom"
      :value="user?.surname || ''"
      @close="closePopupSurname"
      @confirm="confirmPopupSurname"
    />

    <PopupUpdateUserInfo
      :visible="showPopupEmail"
      title="Modifier l'email"
      :value="user?.email || ''"
      @close="closePopupEmail"
      @confirm="confirmPopupEmail"
    />
  </div>
</template>

<style scoped>
 * {
   margin: 0;
   padding: 0;
   font-family: 'Arial', sans-serif;
 }
.my-account-container {
  min-height: 100vh;
  background: #fff;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  font-size: 1rem;
  color: #666;
}

.page-wrapper {
  max-width: 1100px;
  margin: 2rem auto 0;
  padding: 0 2rem 3rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 4rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  color: #1f2937;
}

.back-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.7rem;
  height: 2.7rem;
  border: 2px solid #2d2d2d;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
}

.page-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  text-align: center;
  transform: translateX(-4.5rem);
}

.account-card {
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff;
  border: 1px solid #dedede;
  border-radius: 8px;
  padding: 2.2rem 3rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.15rem 0;
}

.info-main {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.label {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.value {
  font-size: 1rem;
  color: #1f2937;
}

.modify-button {
  display: flex;
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

.modify-button:hover {
  color: #4b5563;
}

.edit-icon {
  width: 1.9rem;
  height: 1.9rem;
}

@media (max-width: 768px) {
  .page-wrapper {
    padding: 0 1rem 2rem;
  }

  .header-row {
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .page-title {
    flex-basis: 100%;
    text-align: left;
    transform: none;
  }

  .account-card {
    padding: 1.5rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-main {
    grid-template-columns: 1fr;
    gap: 0.4rem;
    width: 100%;
  }
}
</style>
