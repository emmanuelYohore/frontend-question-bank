<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import { notify } from '@/utils/popup'
import { API_V1_URL } from '@/config/api'

interface ItemData {
  id: string
  question: string
  archived: boolean
}

interface BankData {
  id: string
  name: string
  archived: boolean
  items?: ItemData[]
  user?: { name?: string; username?: string }
}

const router = useRouter()
const storeAuth = useAuthStore()
const banks = ref<BankData[]>([])
const currentPage = ref(1)
const itemsPerPage = 8
const input = ref('')
const loading = ref(false)
const showModal = ref(false)
const selectedBank = ref<BankData | null>(null)
const loadingBankItems = ref(false)
const modalError = ref<string | null>(null)

const getCreatorName = (b: BankData) => {
  // @ts-ignore
  return (b.user && (b.user.name || b.user.username)) || b.creator_name || b.created_by || '—'
}

const viewItems = async (b: BankData) => {
  if (!b.id) return

  showModal.value = true
  loadingBankItems.value = true
  modalError.value = null
  selectedBank.value = null

  try {
    const response = await fetch(`${API_V1_URL}/bank-items/${b.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`)
    }

    const data = await response.json()
    selectedBank.value = data
  } catch (err) {
    console.error(err)
    modalError.value = err instanceof Error ? err.message : 'Impossible de charger les items de la banque'
  } finally {
    loadingBankItems.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedBank.value = null
  modalError.value = null
}

const archiveBank = async (b: BankData) => {
  if (!b.id) return
  const shouldArchive = !b.archived
  const action = shouldArchive ? 'Archiver' : 'Désarchiver'
  if (!confirm(`${action} cette banque ?`)) return
  try {
    await fetch(`${API_V1_URL}/bank-items/${b.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({ archived: shouldArchive }),
    })
    b.archived = shouldArchive
  } catch (err) {
    console.error(err)
    notify(`Erreur lors de ${shouldArchive ? 'l\'archivage' : 'la désarchivage'}`, 'error')
  }
}

const getAllBanks = async () => {
  loading.value = true

  try {
    const response = await fetch(`${API_V1_URL}/bank-items?search=${encodeURIComponent(input.value)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    banks.value = await response.json()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const paginatedBanks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return banks.value.slice(start, start + itemsPerPage)
})

const handlePageChange = (pageNum: number) => {
  currentPage.value = pageNum
}

const goBack = () => {
  router.back()
}

watch(input, () => getAllBanks())

onMounted(() => {
  getAllBanks()
})
</script>

<template scoped>
  <div class="page">
    <button class="back-btn" @click="goBack">
      <span class="back-circle">←</span>
      Retour
    </button>

    <h1 class="page-title">Gestion des Banques d'Items</h1>

    <div class="search-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        class="search-input"
        type="text"
        v-model="input"
        placeholder="Chercher une banque d'items par nom"
      />
    </div>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else>
      <p v-if="banks.length === 0" class="empty-state">Aucune banque trouvée.</p>
      <p v-else class="user-count">Nombre de banques : {{ banks.length }}</p>

      <ul class="user-list">
        <li class="user-card" v-for="bank in paginatedBanks" :key="bank.id">
          <div class="user-info">
            <div class="user-row"><span class="label">Nom :</span><span class="value">{{ bank.name }}</span></div>
            <div class="user-row"><span class="label">Créateur :</span><span class="value">{{ getCreatorName(bank) }}</span></div>
            <div class="user-row"><span class="label">Archivé :</span><span class="value">{{ bank.archived ? 'Oui' : 'Non' }}</span></div>

            <div class="action-row">
              <button class="action-button" @click="viewItems(bank)" title="Voir les items">Voir items</button>
              <button class="action-button danger" @click="archiveBank(bank)" :title="bank.archived ? 'Désarchiver' : 'Archiver'">
                {{ bank.archived ? 'Désarchiver' : 'Archiver' }}
              </button>
            </div>
          </div>
        </li>
      </ul>

      <Paginate
        :page-count="Math.ceil(banks.length / itemsPerPage)"
        :click-handler="handlePageChange"
        :prev-text="'← Previous'"
        :next-text="'Next →'"
        :container-class="'pagination'"
        :page-class="'page-item'"
        :active-class="'active'"
      />
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Items de la banque</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <div v-if="loadingBankItems" class="modal-loading">Chargement...</div>
        <div v-else-if="modalError" class="modal-error">{{ modalError }}</div>
        <div v-else-if="selectedBank">
          <p class="modal-item-label"><strong>Banque :</strong> {{ selectedBank.name }}</p>
          <p class="modal-item-label"><strong>Créateur :</strong> {{ getCreatorName(selectedBank) }}</p>
          <p class="modal-item-label"><strong>Archivé :</strong> {{ selectedBank.archived ? 'Oui' : 'Non' }}</p>

          <div v-if="!selectedBank.items || selectedBank.items.length === 0" class="modal-empty">
            Aucune item dans cette banque.
          </div>

          <ul v-else class="modal-list">
            <li v-for="item in selectedBank.items" :key="item.id" class="modal-list-item">
              <span>{{ item.question }}</span>
              <span class="modal-item-meta">Archivé : {{ item.archived ? 'Oui' : 'Non' }}</span>
            </li>
          </ul>
        </div>
      </div>
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
  font-family: 'Arial', sans-serif;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  width: min(92vw, 560px);
  max-height: 80vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.modal-item-label,
.modal-empty {
  margin-bottom: 1rem;
  color: #374151;
  font-size: 0.95rem;
}

.modal-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.modal-list-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #111827;
}

.modal-item-meta {
  color: #6b7280;
  font-size: 0.85rem;
}

.modal-loading,
.modal-error {
  color: #6b7280;
  margin-top: 1rem;
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