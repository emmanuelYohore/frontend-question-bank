<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import DOMPurify from 'dompurify'
import PopupUpdateTitleEnquete from '@/modals/PopupUpdateTitleEnquete.vue'
import PopupUpdateDescriptionEnquete from '@/modals/PopupUpdateDescriptionEnquete.vue'
import PopupUpdateStartMessageEnquete from '@/modals/PopupUpdateStartMessageEnquete.vue'
import PopupUpdateEndMessageEnquete from '@/modals/PopupUpdateEndMessageEnquete.vue'
import FooterComponent from './FooterComponent.vue'
import { notify } from '@/utils/popup'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

interface Enquete {
  id?: string;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  url_enquete?: string;
  archived: boolean;
  repondants_count?: number;
}

const enquete = ref<Enquete | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showTitleModal = ref(false)
const showDescriptionModal = ref(false)
const showStartMessageModal = ref(false)
const showEndMessageModal = ref(false)
const sanitizeHtml = (content: string) => DOMPurify.sanitize(content)
const previewDescription = computed(() => sanitizeHtml(enquete.value?.description ?? ''))
const previewStartMessage = computed(() => sanitizeHtml(enquete.value?.start_message ?? ''))
const previewEndMessage = computed(() => sanitizeHtml(enquete.value?.end_message ?? ''))

const enqueteId = route.params.enqueteId

// Récupérer les détails de l'enquête
const getEnqueteDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.userId}/enquetes/${enqueteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'enquête')
    }
    
    const data = await response.json()
    enquete.value = data
    console.log(`enquete : ${enquete.value}`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

//Update titre
const onConfirmTitle = async (newTitle: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ title: newTitle }),
  })
    .then(res => res.json())
    .then(() => {
      if (enquete.value) {
        enquete.value.title = newTitle
      }
      showTitleModal.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

//Update description
const onConfirmDescription = async (newDescription: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ description: newDescription }),
  })
    .then(res => res.json())
    .then(() => {
      if (enquete.value) {
        enquete.value.description = newDescription
      }
      showDescriptionModal.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

//Update start_message
const onConfirmStartMessage = async (newStartMessage: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ start_message: newStartMessage }),
  })
    .then(res => res.json())
    .then(() => {
      if (enquete.value) {
        enquete.value.start_message = newStartMessage
      }
      showStartMessageModal.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

//Update end_message
const onConfirmEndMessage = async (newEndMessage: string) => {
  loading.value = true

  await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}`, {
    method: 'PUT',
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
    body: JSON.stringify({ end_message: newEndMessage }),
  })
    .then(res => res.json())
    .then(() => {
      if (enquete.value) {
        enquete.value.end_message = newEndMessage
      }
      showEndMessageModal.value = false
    })
    .catch(err => console.error(err))
    .finally(() => loading.value = false
  )
}

//Supprimer l'enquête
const deleteEnquete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette enquête ?')) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (response.ok) {
      router.push('/my-enquetes')
    }
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors de la suppression', 'error')
  }
}

//Archiver / Désarchiver l'enquête
const toggleArchive = async () => {
  if (!enquete.value) return
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        archived: !enquete.value.archived
      })
    })
    
    if (response.ok) {
      await getEnqueteDetail()
    }
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors de la mise à jour', 'error')
  }
}

const goBack = () => {
  router.push('/my-enquetes')
}

const goToBanksPage = () => {
  router.push({ name: 'enquete-banks', params: { enqueteId } })
}

const goToPreview = () => {
  router.push({ name: 'preview-enquete', query: { enqueteId: enqueteId as string } })
}

const copyClipboard = async (copyText: string ) => {
  navigator.clipboard.writeText(copyText);
  notify("texte copié", 'success');
}

// Export des réponses en CSV (nouveau format)
const downloadResponsesCSV = async () => {
  if (!enqueteId) return

  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}/export-reponses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement des réponses')
    }

    // Récupérer le fichier CSV
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reponses_enquete_${enquete.value?.title || enqueteId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors du téléchargement des réponses', 'success')
  }
}

// Export des détails des variables en CSV
const downloadVariableDetailsCSV = async () => {
  if (!enqueteId) return

  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}/export-variables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement des variables')
    }

    // Récupérer le fichier CSV
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `variables_enquete_${enquete.value?.title || enqueteId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors du téléchargement des variables', 'success')
  }
}

const clearResponses = async () => {
  if (!confirm('Êtes-vous sûr de vouloir vider toutes les réponses de cette enquête ? Cette action est irréversible.')) {
    return
  }

  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes/${enqueteId}/clear-responses`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression des réponses')
    }

    notify('Les réponses ont été vidées avec succès', 'success')
    await getEnqueteDetail() 
  } catch (err) {
    console.error('Error:', err)
    notify('Erreur lors de la suppression des réponses', 'error')
  }
}

onMounted(() => {
  getEnqueteDetail()
})
</script>

<template>
  <div class="detail-page">
    <div class="header-row">
      <button class="back-btn" @click="goBack">
        <span class="back-circle">&#8592;</span>
        Retour
      </button>
      <h1 class="page-title">Détails d'enquête</h1>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <section v-else-if="enquete" class="card details-card">
      <div class="details-grid">

  <div class="detail-line">
    <span class="label">Titre :</span>
    <span class="value">{{ enquete.title }}</span>
    <button class="btn-modifier" @click="showTitleModal = true">
      <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span>Modifier</span>
    </button>
    <PopupUpdateTitleEnquete v-if="showTitleModal" :currentTitle="enquete.title || ''"
      @confirm="onConfirmTitle" @cancel="showTitleModal = false" />
  </div>

  <div class="detail-line">
    <span class="label">Description :</span>
    <span class="value" v-html="previewDescription"></span>
    <button class="btn-modifier" @click="showDescriptionModal = true">
      <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span>Modifier</span>
    </button>
    <PopupUpdateDescriptionEnquete v-if="showDescriptionModal" :currentDescription="enquete.description || ''"
      @confirm="onConfirmDescription" @cancel="showDescriptionModal = false" />
  </div>

  <div class="detail-line">
    <span class="label">Message de début :</span>
    <span class="value" v-html="previewStartMessage"></span>
    <button class="btn-modifier" @click="showStartMessageModal = true">
      <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span>Modifier</span>
    </button>
    <PopupUpdateStartMessageEnquete v-if="showStartMessageModal" :currentStartMessage="enquete.start_message || ''"
      @confirm="onConfirmStartMessage" @cancel="showStartMessageModal = false" />
  </div>

  <div class="detail-line">
    <span class="label">Message de fin :</span>
    <span class="value" v-html="previewEndMessage"></span>
    <button class="btn-modifier" @click="showEndMessageModal = true">
      <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span>Modifier</span>
    </button>
    <PopupUpdateEndMessageEnquete v-if="showEndMessageModal" :currentEndMessage="enquete.end_message || ''"
      @confirm="onConfirmEndMessage" @cancel="showEndMessageModal = false" />
  </div>

  <div class="detail-line">
    <span class="label">Nombre de répondants :</span>
<span class="value">{{ enquete.repondants_count ?? 0 }}</span>
  </div>

  <div class="detail-line">
    <span class="label">Statut :</span>
    <span class="status" :class="{ archived: enquete.archived }">
      {{ enquete.archived ? 'Archivé' : 'Active' }}
    </span>
  </div>

  <div class="detail-line line-url">
    <span class="label">Lien de l'enquête :</span>
    <span class="value url-value">{{ enquete.url_enquete }}</span>
    <button @click="copyClipboard(enquete.url_enquete || '')" class="btn-copy">Copier</button>
  </div>

</div>

<div class="actions-row">
        <button @click="goToBanksPage" class="btn btn-banks">Voir les banques ajoutées</button>
        <button @click="goToPreview" class="btn btn-preview">Prévisualiser</button>
        <button @click="downloadResponsesCSV" class="btn btn-export">Télécharger les réponses (CSV)</button>
        <button @click="downloadVariableDetailsCSV" class="btn btn-export">Télécharger les variables (CSV)</button>
        <button @click="clearResponses" class="btn btn-clear">Vider les réponses</button>

      </div>

      <div class="actions-row">
        <button @click="toggleArchive" class="btn btn-archive">
          {{ enquete.archived ? 'Désarchiver' : 'Archiver' }}
        </button>
        <button @click="deleteEnquete" class="btn btn-delete">Supprimer</button>

      </div>
    </section>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.detail-page {
  max-width: 1100px;
  margin: 1.5rem auto;
  padding: 0 1rem 2rem;
}

/* ── Header ── */
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

.btn-clear {
  background: #f59e0b;
}

.btn-clear:hover {
  background: #d97706;
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

/* ── États loading / error ── */
.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

/* ── Card ── */
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

/* ── Grille des détails ── */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.detail-line {
  display: grid;
  grid-template-columns: 190px 1fr auto;
  align-items: center;
  gap: 1rem;
  min-height: 2.2rem;
}

/* Ligne lien : label + url + bouton copier + bouton modifier */
.detail-line.line-url {
  grid-template-columns: 190px 1fr auto auto;
}

.label {
  font-weight: 700;
  color: #111827;
  flex-shrink: 0;
}

.value {
  color: #1f2937;
  word-break: break-word;
  line-height: 1.5;
}

.url-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  color: #22c55e;
  font-weight: 500;
}

.status.archived {
  color: #95a5a6;
}

/* ── Bouton Copier ── */
.btn-copy {
  background-color: #EEC05D;
  padding: 0.35rem 0.9rem;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* ── Bouton Modifier ── */
.btn-modifier {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  color: #1f2937;
  font-size: 0.78rem;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-modifier:hover {
  background: #f3f4f6;
}

.edit-icon {
  width: 1.3rem;
  height: 1.3rem;
}

/* ── Lignes d'actions ── */
.actions-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.4rem;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-preview {
  background: #8b5cf6;
}

.btn-preview:hover {
  background: #7c3aed;
}

.btn-banks {
  background: #22a86c;
}

.btn-banks:hover {
  background: #1a9260;
}

.btn-export {
  background: #6366f1;
}

.btn-export:hover {
  background: #4f46e5;
}

.btn-archive {
  min-width: 140px;
  background: #5b8ee6;
}

.btn-archive:hover {
  background: #4a7dd4;
}

.btn-delete {
  background: #ef4423;
}

.btn-delete:hover {
  background: #d93a1b;
}

/* ── Responsive ── */
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

  .detail-line,
  .detail-line.line-url {
    grid-template-columns: 150px 1fr auto;
    gap: 0.6rem;
  }

  .detail-line.line-url {
    grid-template-columns: 150px 1fr auto auto;
  }

  .actions-row {
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .btn {
    flex: 1 1 auto;
    text-align: center;
  }
}

@media (max-width: 500px) {
  .detail-line,
  .detail-line.line-url {
    grid-template-columns: 1fr;
  }

  .btn-modifier {
    flex-direction: row;
    gap: 6px;
  }
}
</style>