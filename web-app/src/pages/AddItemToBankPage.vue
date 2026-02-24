
 <script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface BankItem {
  id: number
  user_id: number
  name: string
  archiver: boolean
}

interface Item {
  id: number
  question: string
  obligatoire: boolean
}

const storeAuth = useAuthStore()
const router = useRouter()
const bankItems = ref<BankItem[]>([])
const items = ref<Item[]>([])
const selectedBankId = ref<number | null>(null)
const selectedItemIds = ref<number[]>([])
const loading = ref(true)
const submitting = ref(false)
const userId = storeAuth.user?.id

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([getAllBankForUser(), getAllItemForUser()])
  } finally {
    loading.value = false
  }
}

const getAllBankForUser = async () => {
  const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storeAuth.token}`,
    },
  })
  const data = await response.json()
  bankItems.value = data
}

const getAllItemForUser = async () => {
  const response = await fetch(`http://localhost:8000/api/v1/users/${userId}/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storeAuth.token}`,
    },
  })
  const data = await response.json()
  items.value = data
}

const toggleItemSelection = (itemId: number) => {
  const index = selectedItemIds.value.indexOf(itemId)
  if (index > -1) {
    selectedItemIds.value.splice(index, 1)
  } else {
    selectedItemIds.value.push(itemId)
  }
}

const isItemSelected = (itemId: number) => {
  return selectedItemIds.value.includes(itemId)
}

const handleSubmit = async () => {
  if (!selectedBankId.value) {
    alert('Veuillez sélectionner une banque')
    return
  }
  
  if (selectedItemIds.value.length === 0) {
    alert('Veuillez sélectionner au moins un item')
    return
  }

  submitting.value = true
  
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${userId}/bank-items/${selectedBankId.value}/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({
          item_ids: selectedItemIds.value
        })
      }
    )

    if (response.ok) {
      const data = await response.json()
      alert(data.message || 'Items ajoutés avec succès')
      router.push(`/bank-item/${selectedBankId.value}`)
    } else {
      const error = await response.json()
      alert(error.error || 'Une erreur est survenue')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Une erreur est survenue lors de l\'ajout des items')
  } finally {
    submitting.value = false
  }
}
 </script>
 
 <template>
  <div class="add-items-to-bank">
    <h1>Ajouter des items à une banque</h1>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-else class="content">
      <div class="columns">
        <!-- Left column: Banks -->
        <div class="column">
          <h2>Mes banque d'items</h2>
          <div v-if="bankItems.length === 0" class="empty-state">
            <p>Aucune banque disponible</p>
            <router-link to="/create-bank-item" class="btn-link">Créer une banque</router-link>
          </div>
          <div v-else class="items-list">
            <div
              v-for="bank in bankItems"
              :key="bank.id"
              class="item-card"
              :class="{ 'selected': selectedBankId === bank.id }"
              @click="selectedBankId = bank.id"
            >
              <div class="radio-wrapper">
                <input
                  type="radio"
                  :id="`bank-${bank.id}`"
                  :value="bank.id"
                  v-model="selectedBankId"
                  class="radio-input"
                />
              </div>
              <label :for="`bank-${bank.id}`" class="item-label">
                {{ bank.name }}
              </label>
            </div>
          </div>
        </div>

        <!-- Right column: Items -->
        <div class="column">
          <h2>Mes items</h2>
          <div v-if="items.length === 0" class="empty-state">
            <p>Aucun item disponible</p>
            <router-link to="/create-item" class="btn-link">Créer un item</router-link>
          </div>
          <div v-else class="items-list">
            <div
              v-for="item in items"
              :key="item.id"
              class="item-card"
              :class="{ 'selected': isItemSelected(item.id) }"
              @click="toggleItemSelection(item.id)"
            >
              <div class="checkbox-wrapper">
                <input
                  type="checkbox"
                  :id="`item-${item.id}`"
                  :checked="isItemSelected(item.id)"
                  @change="toggleItemSelection(item.id)"
                  class="checkbox-input"
                />
              </div>
              <label :for="`item-${item.id}`" class="item-label">
                Item {{ item.id }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button
          @click="handleSubmit"
          :disabled="!selectedBankId || selectedItemIds.length === 0 || submitting"
          class="btn-validate"
        >
          {{ submitting ? 'En cours...' : 'Valider' }}
        </button>
      </div>
    </div>
  </div>
 </template>
 
 <style scoped>
.add-items-to-bank {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 1.8rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.column h2 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.btn-link {
  color: #5b8def;
  text-decoration: none;
  display: inline-block;
  margin-top: 0.5rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-card:hover {
  border-color: #5b8def;
  box-shadow: 0 2px 8px rgba(91, 141, 239, 0.1);
}

.item-card.selected {
  border-color: #5b8def;
  background: #f0f5ff;
}

.radio-wrapper,
.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-input,
.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #5b8def;
}

.item-label {
  flex: 1;
  cursor: pointer;
  font-size: 1rem;
  color: #2c3e50;
  user-select: none;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-validate {
  padding: 0.875rem 3rem;
  background: #5b8def;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.btn-validate:hover:not(:disabled) {
  background: #4a7bde;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 141, 239, 0.3);
}

.btn-validate:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
 </style>
 