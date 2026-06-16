//popup add banks to enquete after enquete create
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface BankItem {
  id: string
  name: string
  archived: boolean
}

const props = defineProps<{
  enqueteId: string
  enqueteTitle: string
}>()

const emit = defineEmits<{
  close: []
  validated: []
}>()

const authStore = useAuthStore()
const userId = authStore.userId
const banks = ref<BankItem[]>([])
const selectedBankIds = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)
const loadingSearchBanks = ref(false)
const inputSearchBanks = ref('')

const canValidate = computed(() => selectedBankIds.value.length > 0 && !submitting.value)

onMounted(async () => {
  await fetchBanks()
})

const fetchBanks = async () => {
  loading.value = true
  try {
    const res = await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    const data = await res.json()
    banks.value = data as BankItem[]
  } catch (err) {
    console.error('Erreur lors du chargement des banques:', err)
  } finally {
    loading.value = false
  }
}

const filterBanks = async () => {
  loadingSearchBanks.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items?search=${inputSearchBanks.value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      banks.value = data
      loadingSearchBanks.value = false
    })
    .catch(error => console.error('Error:', error))
}

watch(inputSearchBanks, () => {
  filterBanks()
})

// add banks to enquete created
const validate = async () => {
    if (!canValidate.value) return
    submitting.value = true
    try {
        await fetch(`http://localhost:8000/api/v1/users/${userId}/enquetes/${props.enqueteId}/bank-items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
            bank_item_ids: selectedBankIds.value,
        }),
        })
        alert('Banques ajoutées à l\'enquête avec succès')
        emit('validated')
        emit('close')
    } catch (err) {
        console.error('Erreur lors de l\'ajout des banques à l\'enquête:', err)
        alert('Une erreur est survenue lors de l\'ajout des banques à l\'enquête')
    } finally {
        submitting.value = false
    }
    }
</script>

<template>
  <!-- Backdrop -->
  <div class="popup-backdrop" @click.self="emit('close')">
    <div class="popup-card" role="dialog" aria-modal="true" aria-labelledby="popup-title">

      <h2 id="popup-title" class="popup-title">
        Ajouter l'enquête créée à une ou plusieurs de vos enquêtes
      </h2>

      <div class="popup-body">
        <!-- Left: enquete -->
        <div class="enquete-col">
          <label class="enquete-row">
            <input type="radio" checked disabled class="enquete-radio" />
            <span class="enquete-label">{{ enqueteTitle }}</span>
          </label>
        </div>

        <!-- Right: search + banques list -->
        <div class="banques-right">
          <div class="search-bar">
            <input
              type="text"
              v-model="inputSearchBanks"
              placeholder="Chercher une banque..."
              class="search-input"
            />
          </div>

          <div class="banques-col">
            <div v-if="loading" class="list-loading">Chargement...</div>
            <div v-else-if="loadingSearchBanks" class="list-loading">Chargement...</div>
            <div v-else-if="banks.length === 0" class="list-empty">Aucune banque trouvée</div>
            <div v-else class="list-scroll">
              <label
                v-for="bank in banks"
                :key="bank.id"
                class="list-row"
                :class="{ 'list-row-disabled': bank.archived }"
              >
                <input
                  type="checkbox"
                  :value="bank.id"
                  v-model="selectedBankIds"
                  :disabled="bank.archived"
                  class="list-checkbox"
                />
                <span class="list-label" :class="{ 'label-disabled': bank.archived }">{{ bank.name }}</span>
                <span v-if="bank.archived" class="badge-archived">Archivé</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="popup-actions">
        <button
          class="btn-valider"
          :disabled="!canValidate"
          @click="validate"
        >
          {{ submitting ? 'En cours...' : 'Valider' }}
        </button>
        <button class="btn-annuler" @click="emit('close')">
          Annuler
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Backdrop ── */
.popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

/* ── Card ── */
.popup-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  width: 100%;
  max-width: 720px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* ── Title ── */
.popup-title {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.4;
}

/* ── Body: two columns ── */
.popup-body {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ── Enquete column (left) ── */
.enquete-col {
  flex: 0 0 auto;
  align-self: center;
}

.enquete-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: default;
  border: 1.5px solid #d0d0d0;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  background: #fafafa;
  min-width: 180px;
}

.enquete-radio {
  accent-color: #1a1a2e;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.enquete-label {
  font-size: 0.95rem;
  color: #1a1a2e;
  font-weight: 500;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


/* ── Right column: search + list ── */
.banques-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Search bar ── */
.search-bar {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  color: #1a1a2e;
}

.search-input::placeholder {
  color: #999;
}

/* ── Banques list ── */
.banques-col {
  border: 1.5px solid #d0d0d0;
  border-radius: 10px;
  background: #fafafa;
  min-height: 160px;
  max-height: 240px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.list-scroll {
  overflow-y: auto;
  padding: 0.4rem 0;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #c4c4c4 transparent;
}

.list-loading,
.list-empty {
  padding: 1rem;
  color: #888;
  font-size: 0.9rem;
  text-align: center;
  margin: auto;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 0;
}

.list-row-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.list-row:not(.list-row-disabled):hover {
  background: #f0f0f5;
}

.list-checkbox {
  accent-color: #4a56e2;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.list-label {
  font-size: 0.95rem;
  color: #1a1a2e;
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


.label-disabled {
  color: #999;
}

.badge-archived {
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
  background: #aaa;
  border-radius: 4px;
  padding: 0.15rem 0.45rem;
  white-space: nowrap;
}

/* ── Actions ── */
.popup-actions {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
}

.btn-valider,
.btn-annuler {
  padding: 0.7rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-valider {
  background: #4a7de2;
  color: #fff;
}

.btn-annuler {
  background: #e84040;
  color: #fff;
}

.btn-valider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-valider:not(:disabled):hover,
.btn-annuler:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}
</style>