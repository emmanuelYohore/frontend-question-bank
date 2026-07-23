<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import PopupUpdateBank from '../modals/PopupUpdateBank.vue'
import { notify } from '@/utils/popup'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()


export interface BankItem {
  id: string
  name: string
  mode: string
  archived: boolean
 
}

const showPopupName = ref(false)

const bankItem = ref<BankItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const bankItemId = route.params.bankItemId

/**
 * Récupère les détails d'une banque d'items
 */
const getBankItemDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.userId}/bank-items/${bankItemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la banque')
    }
    
    const data = await response.json()
    bankItem.value = data
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Supprime une banque d'items
 */
const deleteBankItem = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/bank-items/${bankItemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (response.ok) {
      router.push('/my-bank-items')
    }
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors de la suppression', 'error')
  }
}

/**
 * Bascule le statut d'archivage d'une banque d'items
 */
const toggleArchive = async () => {
  loading.value = true
  if (!bankItem.value) return
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/bank-items/${bankItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        archived: !bankItem.value.archived
      })
    })
    
    if (response.ok) {
      await getBankItemDetail()
      loading.value = false
    }
  } catch (err) {
    console.error('Error:', err)
    loading.value = false
    notify('Erreur lors de la mise à jour', 'error')
  }
}

const goBack = () => {
  router.push('/my-bank-items')
}

const goToItemsPage = () => {
  router.push({ name: 'item-add', params: { bankItemId } })
}

const confirmePopupName = async (newName: string ) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/bank-items/${bankItemId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ name: newName }),
  })
    .then(res => res.json())
    .then(() => {
      if (bankItem.value) {
        bankItem.value.name = newName
      }
      showPopupName.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

onMounted(() => {
  getBankItemDetail()
})
</script>

<template>
  <div class="detail-page">
    <div class="header-row">
      <button class="back-btn" @click="goBack">
        <span class="back-circle">&#8592;</span>
        Retour
      </button>
      <h1 class="page-title">Details de banque d'items</h1>
    </div>

    <div v-if="loading" class="loading">
      Chargement...
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <template v-else-if="bankItem">
      <section class="card details-card">
        <div class="details-grid">
          <div class="details-left">
            <div class="detail-line">
              <span class="label">Nom de la banque :</span>
              <span class="value">{{ bankItem.name }}</span>
            </div>
            <div class="detail-line">
              <span class="label">Status :</span>
              <span class="status" :class="{ archived: bankItem.archived }">
                {{ bankItem.archived ? 'Archiver' : 'Active' }}
              </span>
            </div>
          </div>

          <div class="edit-placeholder" @click="showPopupName = true" style="cursor: pointer;">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </div>
        </div>

        <div class="actions-row">
          <button @click="goToItemsPage" class="btn btn-items">
            Voir les items ajoutes
          </button>
        </div>

        <div class="actions-row">
          <button @click="toggleArchive" class="btn btn-archive">
            {{ bankItem.archived ? 'Desarchiver' : 'Archiver' }}
          </button>
          <button @click="deleteBankItem" class="btn btn-delete">
            Supprimer
          </button>
        </div>
      </section>

      <popup-update-bank
        v-if="showPopupName"
        :current-name="bankItem.name"
        @confirm="confirmePopupName"
        @cancel="showPopupName = false"
      />
    </template>
  </div>

</template>

<style scoped>
 * {
   margin: 0;
   padding: 0;
   font-family: 'Arial', sans-serif;
 }

 .edit-icon {
  width: 1.9rem;
  height: 1.9rem;
}

.detail-page {
  max-width: 1100px;
  margin: 1.5rem auto;
  padding: 0 1rem 2rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1.8rem;
  margin-bottom: 1.2rem;
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

.page-title {
  flex: 1;
  text-align: center;
  margin: 0;
  color: #111827;
  font-size: 1.45rem;
  font-weight: 700;
  transform: translateX(-4rem);
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

.card {
  background: #fff;
  border: 1px solid #d8d8d8;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  padding: 1.4rem 1.8rem;
}

.details-card {
  margin-bottom: 0.85rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 1.5rem;
}

.details-left {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.detail-line {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.label {
  min-width: 140px;
  font-weight: 700;
  color: #111827;
  flex-shrink: 0;
}

.value {
  color: #1f2937;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.5;
}

.status {
  color: #22c55e;
  font-weight: 500;
}

.status.archived {
  color: #95a5a6;
}

.edit-placeholder {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: #1f2937;
  margin-top: 1.8rem;
}

.edit-icon {
  width: 1.35rem;
  height: 1.35rem;
}

.actions-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.4rem;
}

.btn {
  width: 140px;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
}

.btn-items {
  width: 210px;
  background: #22a86c;
}

.btn-archive {
  background: #5b8ee6;
}

.btn-delete {
  background: #ef4423;
}

@media (max-width: 900px) {
  .page-title {
    transform: none;
    text-align: left;
    font-size: 1.2rem;
  }

  .header-row {
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .edit-placeholder {
    margin-top: 0;
  }
}
</style>