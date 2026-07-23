<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'

interface EnqueteData {
  id?: string
  title: string
  url_enquete: string
  archived: boolean
}

const router = useRouter()
const storeAuth = useAuthStore()
const enquetes = ref<EnqueteData[]>([])
const currentPage = ref(1)
const itemsPerPage = 8
const input = ref('')
const loading = ref(false)

const getCreatorName = (e: EnqueteData) => {
  // try common fields returned by API
  // @ts-ignore
  return (e.user && (e.user.name || (e.user.first_name || e.user.username))) ||
    // @ts-ignore
    e.creator_name || e.created_by || '—'
}

const viewBanks = (e: EnqueteData) => {
  if (!e.id) return
  router.push({ name: 'enquete-banks', params: { enqueteId: e.id } })
}

const previewEnquete = (e: EnqueteData) => {
  if (!e.id) return
  router.push({ name: 'preview-enquete', query: { enqueteId: e.id } })
}

const archiveEnquete = async (e: EnqueteData) => {
  if (!e.id) return
  if (!confirm("Archiver cette enquête ?")) return
  try {
    await fetch(`http://localhost:8000/api/v1/enquetes/${e.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({ archived: true }),
    })
    e.archived = true
  } catch (err) {
    console.error(err)
    alert('Erreur lors de l\'archivage')
  }
}

const getAllEnquetes = async () => {
  loading.value = true

  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes?search=${encodeURIComponent(input.value)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    enquetes.value = await response.json()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const paginatedEnquetes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return enquetes.value.slice(start, start + itemsPerPage)
})

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum
}

const goBack = () => {
  router.back()
}

watch(input, () => getAllEnquetes())

onMounted(() => {
  getAllEnquetes()
})
</script>

<template scoped>
  <div class="page">
    <button class="back-btn" @click="goBack">
      <span class="back-circle">←</span>
      Retour
    </button>

    <h1 class="page-title">Gestion des Enquêtes</h1>

    <div class="search-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        class="search-input"
        type="text"
        v-model="input"
        placeholder="Chercher une enquête par titre ou URL"
      />
    </div>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else>
      <p v-if="enquetes.length === 0" class="empty-state">Aucune enquête trouvée.</p>
      <p v-else class="user-count">Nombre d'enquêtes : {{ enquetes.length }}</p>

      <ul class="user-list">
        <li class="user-card" v-for="enquete in paginatedEnquetes" :key="enquete.id">
          <div class="user-info">
            <div class="user-row"><span class="label">Titre :</span><span class="value">{{ enquete.title }}</span></div>
            <div class="user-row"><span class="label">URL :</span><span class="value">{{ enquete.url_enquete }}</span></div>
            <div class="user-row"><span class="label">Créateur :</span><span class="value">{{ getCreatorName(enquete) }}</span></div>
            <div class="user-row"><span class="label">Archivé :</span><span class="value">{{ enquete.archived ? 'Oui' : 'Non' }}</span></div>

            <div class="action-row">
              <button class="action-button" @click="viewBanks(enquete)" title="Voir les banques">Voir banques</button>
              <button class="action-button" @click="previewEnquete(enquete)" title="Prévisualiser">Prévisualiser</button>
              <button class="action-button danger" @click="archiveEnquete(enquete)" title="Archiver">Archiver</button>
            </div>
          </div>
        </li>
      </ul>

      <Paginate
        :page-count="Math.ceil(enquetes.length / itemsPerPage)"
        :click-handler="handlePageChange"
        :prev-text="'← Previous'"
        :next-text="'Next →'"
        :container-class="'pagination'"
        :page-class="'page-item'"
        :active-class="'active'"
      />
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: 'Arial', sans-serif;
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

.page {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: #1f2937;
}

.page-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

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
  min-width: 90px;
  color: #111827;
}

.value {
  color: #374151;
}

.loading,
.empty-state,
.user-count {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.action-row {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-button.danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
</style>

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