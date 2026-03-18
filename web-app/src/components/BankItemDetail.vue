<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import PopupUpdateBank from './PopupUpdateBank.vue'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()


export interface BankItem {
  id: number
  name: string
  archiver: boolean
 
}

interface Item {
  id: number
  question: string
  obligatoire: boolean
}

const items = ref<Item[]>([])
const showPopupName = ref(false)

const bankItem = ref<BankItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const bankItemId = route.params.bankItemId

const getBankItemDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/bank-items/${bankItemId}`, {
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
    items.value = data.items
    console.log(`items : ${items.value}`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

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
    alert('Erreur lors de la suppression')
  }
}

const toggleArchive = async () => {
  if (!bankItem.value) return
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/bank-items/${bankItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        archiver: !bankItem.value.archiver
      })
    })
    
    if (response.ok) {
      await getBankItemDetail()
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Erreur lors de la mise à jour')
  }
}

const goBack = () => {
  router.push('/my-bank-items')
}

const removeItemFromBank = async (itemId: number) => {
  if (!confirm("Etes-vous sur de vouloir supprimer l'item de cette banque ?")) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${storeAuth.user?.id}/bank-items/${bankItemId}/items/detach`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({
          item_ids: [itemId],
        }),
      }
    )

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'item")
    }

    await getBankItemDetail()
  } catch (err) {
    console.error('Error:', err)
    alert("Impossible de supprimer l'item de la banque")
  }
}

const confirmePopupName = async (payload: { value: string }) => {
  if (!payload.value.trim() || !bankItem.value) return
  try {
    const response = await fetch(`http://localhost:8000/api/v1/bank-items/${bankItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({ name: payload.value }),
    })

    if (!response.ok) throw new Error()
    if (bankItem.value) bankItem.value.name = payload.value
    showPopupName.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

const openPopupName = () => {
  showPopupName.value = true
}

const closePopupName = () => {
  showPopupName.value = false
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
              <span class="label">Proprietaire :</span>
              <span class="value">{{ storeAuth.user?.name }}</span>
            </div>
            <div class="detail-line">
              <span class="label">Nom de la banque :</span>
              <span class="value">{{ bankItem.name }}</span>
            </div>
            <div class="detail-line">
              <span class="label">Status :</span>
              <span class="status" :class="{ archived: bankItem.archiver }">
                {{ bankItem.archiver ? 'Archivee' : 'Active' }}
              </span>
            </div>
          </div>

          <div class="edit-placeholder" @click="openPopupName" style="cursor: pointer;">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </div>
        </div>

        <div class="actions-row">
          <button @click="toggleArchive" class="btn btn-archive">
            {{ bankItem.archiver ? 'Desarchiver' : 'Archiver' }}
          </button>
          <button @click="deleteBankItem" class="btn btn-delete">
            Supprimer
          </button>
        </div>
      </section>

      <popup-update-bank
        :visible="showPopupName"
        title="Modifier le nom de la banque"
        label="Nouveau nom"
        :value="bankItem.name || ''"
        @close="closePopupName"
        @confirm="confirmePopupName"
      />

      <section class="card items-card">
        <h2 class="items-title">Items :</h2>

        <div v-if="items.length === 0" class="empty-state">Pas d'items ajoutes</div>

        <ul v-else class="items-list">
          <li v-for="item in items" :key="item.id" class="item-row">
            <span class="item-text">{{ item.question }}</span>
            <button class="remove-item-btn" @click="removeItemFromBank(item.id)">
              <svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              <span>Supprimer l'item de la banque</span>
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
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
}

.value {
  color: #1f2937;
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

.btn-archive {
  background: #5b8ee6;
}

.btn-delete {
  background: #ef4423;
}

.items-title {
  margin: 0 0 0.75rem;
  font-size: 1.7rem;
  font-weight: 700;
  color: #111827;
}

.empty-state {
  color: #6b7280;
}

.items-list {
  list-style: disc;
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
}

.item-text {
  color: #111827;
  line-height: 1.2;
}

.remove-item-btn {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #1f2937;
  cursor: pointer;
  font-size: 1.05rem;
}

.trash-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #ef4423;
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

  .item-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>