<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/utils/popup'
import { API_V1_URL } from '@/config/api'

interface Enquete {
  id: string
  title: string
  archived: boolean
}

const props = defineProps<{
  bankItemId: string
  bankItemName: string
}>()

const emit = defineEmits<{
  close: []
  validated: []
}>()

const authStore = useAuthStore()
const userId = authStore.userId
const enquetes = ref<Enquete[]>([])
const selectedEnqueteIds = ref<string[]>([])
const loading = ref(true)
const submitting = ref(false)
const loadingSearchEnquetes = ref(false)
const inputSearchEnquetes = ref('')

const canValidate = computed(() => selectedEnqueteIds.value.length > 0 && !submitting.value)

onMounted(async () => {
  await fetchEnquetes()
})

const fetchEnquetes = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_V1_URL}/users/${userId}/enquetes`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    const data = await res.json()
    enquetes.value = data as Enquete[]
  } catch (err) {
    console.error('Erreur lors du chargement des enquêtes:', err)
  } finally {
    loading.value = false
  }
}

const filterEnquetes = async () => {
  loadingSearchEnquetes.value = true
  await fetch(`${API_V1_URL}/users/${userId}/enquetes?search=${inputSearchEnquetes.value}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      enquetes.value = data
      loadingSearchEnquetes.value = false
    })
    .catch(error => console.error('Error:', error))
}

watch(inputSearchEnquetes, () => {
  filterEnquetes()
})

const validate = async () => {
  if (!canValidate.value) return
  submitting.value = true
  try {
    for (const enqueteId of selectedEnqueteIds.value) {
      await fetch(`${API_V1_URL}/users/${userId}/enquetes/${enqueteId}/bank-items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({ bank_item_ids: [props.bankItemId] }),
        }
      )
    }
    emit('validated')
  } catch (err) {
    console.error('Erreur:', err)
    notify("Une erreur est survenue lors de l'ajout à l'enquête.", 'error')
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
        Ajouter la banque créer à une ou plusieurs de vos enquêtes
      </h2>

      <div class="popup-body">
        <!-- Left: bank -->
        <div class="item-col">
          <label class="item-row">
            <input type="radio" checked disabled class="item-radio" />
            <span class="item-label" :title="bankItemName">{{ bankItemName }}</span>
          </label>
        </div>

        <!-- Right: search + enquêtes list -->
        <div class="enquetes-right">
          <div class="search-bar">
            <input
              type="text"
              v-model="inputSearchEnquetes"
              placeholder="Chercher une enquête..."
              class="search-input"
            />
          </div>

          <div class="enquetes-col">
            <div v-if="loading" class="list-loading">Chargement...</div>
            <div v-else-if="loadingSearchEnquetes" class="list-loading">Chargement...</div>
            <div v-else-if="enquetes.length === 0" class="list-empty">Aucune enquête trouvée</div>
            <div v-else class="list-scroll">
              <label
                v-for="enquete in enquetes"
                :key="enquete.id"
                class="list-row"
                :class="{ 'list-row-disabled': enquete.archived }"
              >
                <input
                  type="checkbox"
                  :value="enquete.id"
                  v-model="selectedEnqueteIds"
                  :disabled="enquete.archived"
                  class="list-checkbox"
                />
                <span class="list-label" :title="enquete.title" :class="{ 'label-disabled': enquete.archived }">{{ enquete.title }}</span>
                <span v-if="enquete.archived" class="badge-archived">Archivé</span>
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
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ── Item column (left) ── */
.item-col {
  flex: 0 0 auto;
  align-self: center;
  min-width: 0;
}

.item-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  cursor: default;
  border: 1.5px solid #d0d0d0;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  background: #fafafa;
  min-width: 180px;
}

.item-row,
.item-label,
.list-row,
.list-label {
  min-width: 0;
}

.item-label {

  font-size: 0.95rem;
  color: #1a1a2e;
  font-weight: 500;
  flex: 1 1 auto;
  max-width: 600px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-radio {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .list-label {
    font-size: 0.95rem;
    color: #1a1a2e;
    flex: 1 1 auto;
    min-width: 0;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

/* ── Enquêtes list ── */
.enquetes-col {
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
  max-width: 600px;

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