<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import PopupUpdateModalite from '@/modals/PopupUpdateModalite.vue'
import PopupUpdateModaliteEvnV1 from '@/modals/PopupUpdateModaliteEvnV1.vue'
import PopupUpdateModaliteEvnV2 from '@/modals/PopupUpdateModaliteEvnV2.vue'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

interface FormatReponse {
  id?: string
  type: string
}

interface ModaliteReponse {
  id: string
  intitule?: string | null
  min_value?: string | null
  max_value?: string | null
  format_reponse?: FormatReponse
}

interface Item {
  id?: string
  question: string
  obligatoire: boolean
  format_reponse?: FormatReponse | null
  modalite_reponses?: ModaliteReponse[]
}

const item = ref<Item | null>(null)
const formatReponse = ref<FormatReponse | null>(null)
const modalites = ref<ModaliteReponse[]>([])
const originalModalites = ref<ModaliteReponse[]>([])
const modaliteQcmOrQcuToUpdate = ref<ModaliteReponse | null>(null)
const modaliteEvnToUpdate = ref<ModaliteReponse | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)
const hasChanged = ref(false)
const isSaving = ref(false)

const itemId = route.params.itemId

const isQCMorQCU = computed(() =>
  formatReponse.value?.type === 'qcm' || formatReponse.value?.type === 'qcu'
)
const isEVN = computed(() => formatReponse.value?.type === 'evn')

const showModalQcmOrQcu = ref(false)
const showModalEvnV1 = ref(false)
const showModalEvnV2 = ref(false)

const onConfirmPopupQcmOrQcu = async (newModalite: string) => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteQcmOrQcuToUpdate.value?.id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
    body: JSON.stringify({ intitule: newModalite }),
  })
    .then((res) => res.json())
    .then(() => {
      getModalites()
      showModalQcmOrQcu.value = false
    })
    .catch((err) => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

const onConfirmPopupEvnV1 = async (newV1: string) => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteEvnToUpdate.value?.id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
    body: JSON.stringify({ min_value: newV1 }),
  })
    .then((res) => res.json())
    .then(() => {
      getModalites()
      showModalEvnV1.value = false
    })
    .catch((err) => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

const onConfirmPopupEvnV2 = async (newV2: string) => {
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/modalite-reponses/${modaliteEvnToUpdate.value?.id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
    body: JSON.stringify({ max_value: newV2 }),
  })
    .then((res) => res.json())
    .then(() => {
      getModalites()
      showModalEvnV2.value = false
    })
    .catch((err) => {
      console.error('Error:', err)
      alert('Impossible de modifier la modalité')
    })
}

const getModalites = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/items/${itemId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de l'item")
    }

    const data = await response.json()
    item.value = data
    formatReponse.value = data.format_reponse
    modalites.value = data.modalite_reponses
    originalModalites.value = JSON.parse(JSON.stringify(data.modalite_reponses))
    hasChanged.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const removeModalite = async (modaliteId: string) => {
  if (!confirm('Etes-vous sur de vouloir supprimer cette modalité ?')) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/modalite-reponses/${modaliteId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la modalité')
    }

    await getModalites()
  } catch (err) {
    console.error('Error:', err)
    alert('Impossible de supprimer la modalité')
  }
}

 const saveModalitesOrder = async () => {

  loading.value = true
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/items/${itemId}/modalite-reponses/order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({
          modalite_ids: modalites.value.map((m) => m.id),
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la sauvegarde de l\'ordre des modalités')
    }

    hasChanged.value = false
  } catch (err) {
    console.error('Error:', err)
    alert('Impossible de sauvegarder l\'ordre des modalités')
  } finally {
    loading.value = false
  }

}

const onDragEnd = () => {
  hasChanged.value = true
}

const goBack = () => {
  router.push({ name: 'item-detail', params: { itemId: itemId } })
}

onMounted(() => {
  getModalites()
})
</script>

<template>
  <div class="modalite-item-page">
    <!-- Header -->
    <div class="header-row">
      <button class="back-btn" @click="goBack">
        <span class="back-circle">&#8592;</span>
        <span>Retour</span>
      </button>
      <h1 class="page-title">Modalités de l'item</h1>
    </div>

    <!-- States -->
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!item" class="error">Item introuvable</div>

    <template v-else>
      <!-- QCM / QCU -->
      <template v-if="isQCMorQCU">
        
        <h2>Nom de l'item: {{ item?.question }}</h2>
        <div v-if="modalites.length === 0" class="error">Aucune modalité ajoutée à cet item</div>

        <!-- Single item: no drag -->
        <ul v-else-if="modalites.length === 1" class="items-list">
          <li v-for="modalite in modalites" :key="modalite.id" class="item-row">
            <span class="item-text" :title="modalite.intitule ?? ''">{{ modalite.intitule }}</span>
            <div class="actions">
              <button
                class="icon-btn edit"
                title="Modifier"
                @click="modaliteQcmOrQcuToUpdate = modalite; showModalQcmOrQcu = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="icon-btn" title="Supprimer" @click="removeModalite(modalite.id)">
                <svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18" /><path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </li>
        </ul>

        <!-- Multiple items: drag & drop -->
        <ul v-else class="items-list">
          <draggable v-model="modalites" :animation="150" item-key="id" @end="onDragEnd">
            <li v-for="modalite in modalites" :key="modalite.id" class="item-row">
              <!-- Drag handle -->
             					<svg class="item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <circle cx="9.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>


              <span class="item-text-draggable" :title="modalite.intitule ?? ''">{{ modalite.intitule }}</span>

              <div class="actions">
                <button
                  class="icon-btn edit"
                  title="Modifier"
                  @click="modaliteQcmOrQcuToUpdate = modalite; showModalQcmOrQcu = true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button class="icon-btn" title="Supprimer" @click="removeModalite(modalite.id)">
                  <svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18" /><path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                  </svg>
                </button>
              </div>
            </li>
          </draggable>
        </ul>

        <PopupUpdateModalite
          v-if="showModalQcmOrQcu"
          :current-modalite="modaliteQcmOrQcuToUpdate?.intitule || ''"
          @confirm="onConfirmPopupQcmOrQcu"
          @cancel="showModalQcmOrQcu = false"
        />
      </template>

      <!-- EVN -->
      <template v-else-if="isEVN">
        <div v-if="modalites.length === 0" class="error">Aucune modalité ajoutée à cet item</div>

        <!-- Single item: no drag -->
        <ul v-else-if="modalites.length === 1" class="items-list">
          <li v-for="modalite in modalites" :key="modalite.id" class="item-row evn-row">
            <div class="evn-values">
              <span class="evn-label">Valeur minimale</span>
              <span class="item-text">{{ modalite.min_value }}</span>
              <button
                class="icon-btn edit"
                title="Modifier V1"
                @click="modaliteEvnToUpdate = modalite; showModalEvnV1 = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <div class="evn-separator" />
            <div class="evn-values">
              <span class="evn-label">Valeur maximale</span>
              <span class="item-text">{{ modalite.max_value }}</span>
              <button
                class="icon-btn edit"
                title="Modifier V2"
                @click="modaliteEvnToUpdate = modalite; showModalEvnV2 = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </li>
        </ul>

        <!-- Multiple EVN: drag & drop -->
        <ul v-else class="items-list">
          <draggable v-model="modalites" :animation="150" item-key="id" @end="onDragEnd">
            <li v-for="modalite in modalites" :key="modalite.id" class="item-row evn-row">
              					<svg class="item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <circle cx="9.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>


              <div class="evn-values">
                <span class="evn-label">Valeur minimale</span>
                <span class="item-text-draggable">{{ modalite.min_value }}</span>
                <button
                  class="icon-btn edit"
                  title="Modifier V1"
                  @click="modaliteEvnToUpdate = modalite; showModalEvnV1 = true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div class="evn-separator" />
              <div class="evn-values">
                <span class="evn-label">Valeur maximale</span>
                <span class="item-text-draggable">{{ modalite.max_value }}</span>
                <button
                  class="icon-btn edit"
                  title="Modifier V2"
                  @click="modaliteEvnToUpdate = modalite; showModalEvnV2 = true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </li>
          </draggable>
        </ul>

        <PopupUpdateModaliteEvnV1
          v-if="showModalEvnV1"
          :current-v1="modaliteEvnToUpdate?.min_value || ''"
          @confirm="onConfirmPopupEvnV1"
          @cancel="showModalEvnV1 = false"
        />
        <PopupUpdateModaliteEvnV2
          v-if="showModalEvnV2"
          :current-v2="modaliteEvnToUpdate?.max_value || ''"
          @confirm="onConfirmPopupEvnV2"
          @cancel="showModalEvnV2 = false"
        />
      </template>

      <!-- Fallback -->
      <div v-else class="error">Aucune modalité disponible</div>
    </template>

    <!-- Confirm order button -->
    <div v-if="hasChanged" class="action-buttons">
      <button class="confirm-btn" :disabled="isSaving" @click="saveModalitesOrder">
        {{ isSaving ? 'Enregistrement...' : 'Confirmer' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.modalite-item-page {
  max-width: 900px;
  margin: 1rem auto;
  padding: 0 2rem;
}

/* ── Header ─────────────────────────────────── */
.header-row {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #1f2937;
  font-size: 1rem;
}

.back-circle {
  width: 2.4rem;
  height: 2.4rem;
  border: 2px solid #111827;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 1.45rem;
  color: #111827;
  font-weight: 700;
  transform: translateX(-4rem);
}

/* ── States ──────────────────────────────────── */
.loading,
.error {
  text-align: center;
  padding: 1rem 0;
}

.error {
  color: #ef4423;
}

/* ── List ────────────────────────────────────── */
.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 0.25rem;
}

/* ── Card ────────────────────────────────────── */
.item-row {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  gap: 0.75rem;
  transition: box-shadow 0.2s ease;
}

.item-row:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* EVN card: column layout */
.evn-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.evn-row .item-icon {
  align-self: center;
}

.evn-values {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
}

.evn-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 4.5rem;
  flex-shrink: 0;
}

.evn-separator {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
}

/* ── Text ────────────────────────────────────── */
.item-text-draggable {
  flex: 1;
  color: #111827;
  font-size: 0.95rem;
  cursor: move;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.item-text {
  flex: 1;
  color: #111827;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

/* ── Drag handle ─────────────────────────────── */
.item-icon {
  width: 1.4rem;
  height: 1.4rem;
  flex-shrink: 0;
  opacity: 0.4;
  cursor: move;
}

/* ── Action buttons ──────────────────────────── */
.actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  margin-left: auto;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.icon-btn svg {
  width: 1.2rem;
  height: 1.2rem;
}

.icon-btn.edit svg {
  color: black;
}

.trash-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #ef4423;
}

/* ── Confirm bar ─────────────────────────────── */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 1rem;
}

.confirm-btn {
  padding: 0.75rem 2rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #059669;
}

.confirm-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 900px) {
  .page-title {
    transform: none;
    text-align: left;
    font-size: 1.2rem;
  }

  .header-row {
    flex-wrap: wrap;
  }
}
</style>