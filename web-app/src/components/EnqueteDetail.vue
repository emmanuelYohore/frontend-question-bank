<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  url_enquete?: string;
  archiver: boolean;
}

const enquete = ref<Enquete | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const enqueteId = route.params.enqueteId

const getEnqueteDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`, {
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

const deleteEnquete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette enquête ?')) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`, {
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
    alert('Erreur lors de la suppression')
  }
}

const toggleArchive = async () => {
  if (!enquete.value) return
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        archiver: !enquete.value.archiver
      })
    })
    
    if (response.ok) {
      await getEnqueteDetail()
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Erreur lors de la mise à jour')
  }
}

const goBack = () => {
  router.push('/my-enquetes')
}

const goToBanksPage = () => {
  router.push({ name: 'enquete-banks', params: { enqueteId } })
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
        <div class="details-left">
          <div class="detail-line">
            <span class="label">Propriétaire:</span>
            <span class="value">{{ storeAuth.user?.surname }}</span>
          </div>
          <div class="detail-line">
            <span class="label">Titre :</span>
            <span class="value">{{ enquete.title }}</span>
          </div>
          <div class="detail-line">
            <span class="label">Message de début :</span>
            <span class="value">{{ enquete.start_message }}</span>
          </div>
          <div class="detail-line">
            <span class="label">Message de fin :</span>
            <span class="value">{{ enquete.end_message }}</span>
          </div>
          <div class="detail-line">
            <span class="label">Statut :</span>
            <span class="status" :class="{ archived: enquete.archiver }">
              {{ enquete.archiver ? 'Archivee' : 'Active' }}
            </span>
          </div>
          <div class="detail-line">
            <span class="label">Lien de l'enquête :</span>
            <span class="value">{{ enquete.url_enquete }}</span>
          </div>
        </div>

        <div class="edit-column">
          <div class="edit-placeholder">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </div>
          <div class="edit-placeholder">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </div>
          <div class="edit-placeholder">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <button @click="goToBanksPage" class="btn btn-banks">Voir les banques ajoutes</button>
      </div>

      <div class="actions-row">
        <button @click="toggleArchive" class="btn btn-archive">
          {{ enquete.archiver ? 'Desarchiver' : 'Archiver' }}
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
  min-width: 170px;
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

.edit-column {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: 1.3rem;
}

.edit-placeholder {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: #1f2937;
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
  width: 210px;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
}

.btn-banks {
  background: #22a86c;
}

.btn-archive {
  width: 140px;
  background: #5b8ee6;
}

.btn-delete {
  width: 140px;
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

  .edit-column {
    margin-top: 0;
  }
}
</style>