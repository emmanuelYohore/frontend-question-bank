<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import PopupRandomItemsCount from '@/modals/PopupRandomItemsCount.vue'
import { notify } from '@/utils/popup'

interface BankItem {
  id: string
  name: string
  mode: string           
  enquete_bank_id: string
  nombre_items_aleatoires: number | null
  items?: Array<any>
}

// Interface pour l'enquête pour afficher le nom de l'enquete dans le titre de la page
interface Enquete {
  id?: string;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  archived: boolean;
  repondants_count?: number;
}


const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

const enqueteId = route.params.enqueteId
const bankItems = ref<BankItem[]>([])
const originalBankItems = ref<BankItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const hasChanged = ref(false)
const isSaving = ref(false)

// Popup state
const showRandomItemsPopup = ref(false)
const selectedBankForPopup = ref<BankItem | null>(null)
const pendingMode = ref<string | null>(null)

const enquete = ref<Enquete | null>(null)

const fetchEnqueteDetails = async () => {
  loading.value = true
  error.value = null

  try {
	const response = await fetch(
	  `http://localhost:8000/api/v1/users/${storeAuth.userId}/enquetes/${enqueteId}`,
	  {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json',
		  Authorization: `Bearer ${storeAuth.token}`,
		},
	  }
	)

	if (!response.ok) {
	  throw new Error('Erreur lors de la récupération des détails de l\'enquête')
	}

	enquete.value = await response.json()
  } catch (err) {
	error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
	loading.value = false
  }
}

const getBanksAssociatedToEnquete = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${storeAuth.userId}/enquetes/${enqueteId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des banques')
    }

    const data = await response.json()

    bankItems.value = (data.bank_items || []).map((bank: any) => ({
      id: bank.id,
      name: bank.name,
      archived: bank.archived,
      items: bank.items || [],
      mode: bank.pivot?.mode ?? 'systematique',
      nombre_items_aleatoires: bank.pivot?.nombre_items_aleatoires ?? null,
      enquete_bank_id: bank.pivot?.id,
    }))

    originalBankItems.value = JSON.parse(JSON.stringify(bankItems.value))
    hasChanged.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const removeBankFromEnquete = async (bankItemId: string) => {
  if (!confirm('Etes-vous sur de vouloir supprimer la banque de cette enquete ?')) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${storeAuth.userId}/enquetes/${enqueteId}/bank-items/detach`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ bank_item_ids: [bankItemId] }),
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la banque')
    }

    await getBanksAssociatedToEnquete()
  } catch (err) {
    console.error('Error:', err)
    notify("Impossible de supprimer la banque de l'enquete", 'error')
  }
}

const saveBankItemsOrder = async () => {
  isSaving.value = true
  error.value = null

  try {
    const orderedIds = bankItems.value.map((b) => b.id)

    const response = await fetch(
      `http://localhost:8000/api/v1/users/${storeAuth.userId}/enquetes/${enqueteId}/bank-items/order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ bank_item_ids: orderedIds }),
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => null)
      throw new Error(errData?.error || "Erreur lors de la sauvegarde de l'ordre des banques")
    }

    originalBankItems.value = JSON.parse(JSON.stringify(bankItems.value))
    hasChanged.value = false
    notify('Ordre sauvegardé avec succès', 'success')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error(err)
    notify(error.value, 'error')
  } finally {
    isSaving.value = false
  }
}

const onDragEnd = () => {
  hasChanged.value = true
}

const updateBankMode = async (enqueteBankId: string, newMode: string) => {
	  console.log('enqueteBankId:', enqueteBankId)

  if (newMode === 'aleatoire') {
    const bank = bankItems.value.find((b) => b.enquete_bank_id === enqueteBankId)
    if (bank) {
      selectedBankForPopup.value = bank
      pendingMode.value = newMode
      showRandomItemsPopup.value = true
    }
    return
  }

  // Si le mode est "systematique", mettre à jour directement sans popup
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/enquete-banks/${enqueteBankId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ 
          mode: newMode,
          nombre_items_aleatoires: null 
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du mode')
    }

    const bank = bankItems.value.find((b) => b.enquete_bank_id === enqueteBankId)
    if (bank) {
      bank.mode = newMode
      bank.nombre_items_aleatoires = null
    }
  } catch (err) {
    console.error('Error:', err)
    notify('Impossible de mettre à jour le mode de la banque', 'error')
  }
}

const handleRandomItemsConfirm = async (count: number) => {
  if (!selectedBankForPopup.value || !pendingMode.value) return

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/enquete-banks/${selectedBankForPopup.value.enquete_bank_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ 
          mode: pendingMode.value,
          nombre_items_aleatoires: count
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du mode')
    }

    // Mettre à jour le state local
    if (selectedBankForPopup.value) {
      selectedBankForPopup.value.mode = pendingMode.value
      selectedBankForPopup.value.nombre_items_aleatoires = count
    }

    showRandomItemsPopup.value = false
    selectedBankForPopup.value = null
    pendingMode.value = null
  } catch (err) {
    console.error('Error:', err)
    notify('Impossible de mettre à jour le mode de la banque', 'error')
  }
}

const handleRandomItemsCancel = () => {
  showRandomItemsPopup.value = false
  selectedBankForPopup.value = null
  pendingMode.value = null
}

const openRandomItemsPopupForEdit = (bank: BankItem) => {
  selectedBankForPopup.value = bank
  pendingMode.value = bank.mode
  showRandomItemsPopup.value = true
}

const goBack = () => {
  router.push({ name: 'enquete-detail', params: { enqueteId } })
}

onMounted(async () => {
  await getBanksAssociatedToEnquete()
  await fetchEnqueteDetails()
})
</script>

<template>
	<div class="banks-added-page">
		<div class="header-row">
			<button class="back-btn" @click="goBack">
				<span class="back-circle">&#8592;</span>
				<span>Retour</span>
			</button>
			<h1 class="page-title">Banques ajoutées</h1>
		</div>
		<h2 class="title-enq">Enquête: {{ enquete?.title }}</h2>


		<div v-if="loading" class="loading">Chargement...</div>
		<div v-else-if="error" class="error">{{ error }}</div>
		<div v-else-if="bankItems.length === 0" class="error">Aucune banque ajoutée à cette enquête</div>
		<ul v-else-if="bankItems.length === 1" class="banks-list">
			<li v-for="bank in bankItems" :key="bank.id" class="bank-row">
				<span class="bank-text">
					<span>{{ bank.name }}</span>
					<select
						class="mode-select"
						:value="bank.mode"
						@change="(e) => updateBankMode(bank.enquete_bank_id, (e.target as HTMLSelectElement).value)"
					>
						<option value="systematique">Systématique</option>
						<option value="aleatoire">Aléatoire</option>
					</select>
					<span v-if="bank.mode === 'aleatoire' && bank.nombre_items_aleatoires" class="random-count-badge">
						{{ bank.nombre_items_aleatoires }} item(s)
					</span>
				</span>
				<div class="icon-buttons-group">
					<button 
						v-if="bank.mode === 'aleatoire' && bank.nombre_items_aleatoires"
						class="icon-btn edit-btn" 
						@click="openRandomItemsPopupForEdit(bank)" 
						title="Modifier le nombre d'items"
					>
						<svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
					</button>
					<button class="icon-btn" @click="removeBankFromEnquete(bank.id)" title="Supprimer">
						<svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18" />
							<path d="M8 6V4h8v2" />
							<path d="M19 6l-1 14H6L5 6" />
							<path d="M10 11v6" />
							<path d="M14 11v6" />
						</svg>
					</button>
				</div>
			</li>
		</ul>

		<ul v-else class="banks-list">
			<draggable v-model="bankItems" :animation="150" item-key="id" @end="onDragEnd">
				<li v-for="bank in bankItems" :key="bank.id" class="bank-row">
					<svg class="bank-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <circle cx="9.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>

					<span class="bank-text-draggable">
						<span>{{ bank.name }}</span>
						<select class="mode-select" :value="bank.mode" @change="(e) => updateBankMode(bank.enquete_bank_id, (e.target as HTMLSelectElement).value)">
							<option value="systematique">Systématique</option>
							<option value="aleatoire">Aléatoire</option>
					</select>
					<span v-if="bank.mode === 'aleatoire' && bank.nombre_items_aleatoires" class="random-count-badge">
						{{ bank.nombre_items_aleatoires }} item(s)
					</span>
				</span>
				<div class="icon-buttons-group">
					<button 
						v-if="bank.mode === 'aleatoire' && bank.nombre_items_aleatoires"
						class="icon-btn edit-btn" 
						@click="openRandomItemsPopupForEdit(bank)" 
						title="Modifier le nombre d'items"
					>
						<svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
					</button>
					<button class="icon-btn" @click="removeBankFromEnquete(bank.id)" title="Supprimer">
						<svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18" />
							<path d="M8 6V4h8v2" />
							<path d="M19 6l-1 14H6L5 6" />
							<path d="M10 11v6" />
							<path d="M14 11v6" />
						</svg>
					</button>
				</div>
				</li>
			</draggable>
		</ul>

		<div v-if="hasChanged" class="action-buttons">
			<button class="confirm-btn" @click="saveBankItemsOrder" :disabled="isSaving">
				{{ isSaving ? 'Enregistrement...' : 'Confirmer' }}
			</button>
		</div>

		<PopupRandomItemsCount
			v-if="selectedBankForPopup"
			:is-open="showRandomItemsPopup"
			:bank-name="selectedBankForPopup.name"
			:max-items="selectedBankForPopup.items?.length || 0"
			:current-count="selectedBankForPopup.nombre_items_aleatoires"
			@confirm="handleRandomItemsConfirm"
			@cancel="handleRandomItemsCancel"
		/>
	</div>
</template>

<style scoped>
* {
	margin: 0;
	padding: 0;
	font-family: 'Arial', sans-serif;
}

.title-enq {
  font-size: 1.2rem;
  color: #111827;
  margin-bottom: 1rem;
}

.banks-added-page {
	max-width: 900px;
	margin: 1rem auto;
	padding: 0 2rem;
}

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

.loading,
.error {
	text-align: center;
	padding: 1rem 0;
}

.error {
	color: #ef4423;
}

/* Scrollable container */
.banks-list {
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

/* Each bank is now a card */
.bank-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 1.25rem;
	background: #fff;
	border: 1px solid #e0e0e0;
	border-radius: 14px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	gap: 0.75rem;
	transition: box-shadow 0.2s ease;
}

.bank-row:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bank-text-draggable {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	color: #111827;
	font-size: 0.95rem;
	cursor: move;
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.5;
}

.bank-text {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	color: #111827;
	font-size: 0.95rem;
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.5;
}

.bank-icon {
	width: 1.4rem;
	height: 1.4rem;
	flex-shrink: 0;
	opacity: 0.4;
	cursor: move;
}

.mode-select {
	padding: 0.35rem 0.6rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	font-size: 0.875rem;
	color: #111827;
	background-color: #fff;
	cursor: pointer;
	transition: border-color 0.2s;
	flex-shrink: 0;
}

.mode-select:hover {
	border-color: #9ca3af;
}

.mode-select:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.icon-btn {
	border: none;
	background: transparent;
	cursor: pointer;
	padding: 0.1rem;
	flex-shrink: 0;
}

.icon-buttons-group {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.edit-icon {
	width: 1.2rem;
	height: 1.2rem;
}

.edit-btn:hover .edit-icon {
	color: #2563eb;
}

.trash-icon {
	width: 1.2rem;
	height: 1.2rem;
	color: #ef4423;
}

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

.random-count-badge {
	background: #dbeafe;
	color: #0369a1;
	padding: 0.25rem 0.75rem;
	border-radius: 6px;
	font-size: 0.8rem;
	font-weight: 600;
	white-space: nowrap;
	flex-shrink: 0;
}

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