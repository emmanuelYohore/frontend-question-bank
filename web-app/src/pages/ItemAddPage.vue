<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'


interface Item {
	id: string
	question: string
}

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

const bankItemId = route.params.bankItemId
const items = ref<Item[]>([])
const originalItems = ref<Item[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const hasChanged = ref(false)
const isSaving = ref(false)

/**
 * Récupère les items associés à la banque pour un userId
 */
const getItemsAssociatedToBanks = async () => {
	loading.value = true
	error.value = null

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.userId}/bank-items/${bankItemId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${storeAuth.token}`,
				},
			}
		)

		if (!response.ok) {
			throw new Error('Erreur lors de la recuperation des items')
		}

		const data = await response.json()
		items.value = data.items
		originalItems.value = JSON.parse(JSON.stringify(data.items))
		hasChanged.value = false
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
	} finally {
		loading.value = false
	}
}

/**
 * Supprime l'association d'un item à la banque
 */
const removeItemFromBank = async (itemId: string) => {
	if (!confirm("Etes-vous sur de vouloir supprimer l'item de cette banque ?")) {
		return
	}

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.userId}/bank-items/${bankItemId}/items/detach`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${storeAuth.token}`,
				},
				body: JSON.stringify({ item_ids: [itemId] }),
			}
		)

		if (!response.ok) {
			throw new Error("Erreur lors de la suppression de l'item")
		}

		await getItemsAssociatedToBanks()
	} catch (err) {
		console.error('Error:', err)
		alert("Impossible de supprimer l'item de la banque")
	}
}

const saveItemsOrder = async () => {
	isSaving.value = true
	error.value = null

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.userId}/bank-items/${bankItemId}/items/order`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${storeAuth.token}`,
				},
				body: JSON.stringify({
					ordered_item_ids: items.value.map((item) => item.id),
				}),
			}
		)

		if (!response.ok) {
			throw new Error('Erreur lors de la mise à jour de l\'ordre des items')
		}

		originalItems.value = JSON.parse(JSON.stringify(items.value))
		hasChanged.value = false
		alert('Ordre sauvegardé avec succès')
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
		console.error(err)
		alert(error.value)
	} finally {
		isSaving.value = false
	}
}

const onDragEnd = () => {
	hasChanged.value = true
}

const goBack = () => {
	router.push({ name: 'bank-item-detail', params: { bankItemId } })
}

onMounted(async() => {
	await getItemsAssociatedToBanks()
})
</script>

<template>
	<div class="items-added-page">
		<div class="header-row">
			<button class="back-btn" @click="goBack">
				<span class="back-circle">&#8592;</span>
				<span>Retour</span>
			</button>
			<h1 class="page-title">Items ajoutes</h1>
		</div>

		<div v-if="loading" class="loading">Chargement...</div>
		<div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="items.length === 0" class="error">Aucun item ajouté à cette banque</div>
		<ul v-else-if="items.length === 1" class="items-list">
				<li v-for="item in items" :key="item.id" class="item-row">
					<span class="item-text" :title="item.question">{{ item.question }}</span>
					<button class="icon-btn" @click="removeItemFromBank(item.id)" title="Supprimer">
						<svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18" />
							<path d="M8 6V4h8v2" />
							<path d="M19 6l-1 14H6L5 6" />
							<path d="M10 11v6" />
							<path d="M14 11v6" />
						</svg>
					</button>
				</li>
			</ul>
		<ul v-else class="items-list">
			<draggable v-model="items" :animation="150" item-key="id" @end="onDragEnd">
				<li v-for="item in items" :key="item.id" class="item-row">
					<svg class="item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <circle cx="9.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="9.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="6" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="10" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="14" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="14.5" cy="18" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>

					<span class="item-text-draggable" :title="item.question">{{ item.question }}</span>
					<button class="icon-btn" @click="removeItemFromBank(item.id)" title="Supprimer">
						<svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18" />
							<path d="M8 6V4h8v2" />
							<path d="M19 6l-1 14H6L5 6" />
							<path d="M10 11v6" />
							<path d="M14 11v6" />
						</svg>
					</button>
				</li>
			</draggable>	
		</ul>

		<div v-if="hasChanged" class="action-buttons">
			<button class="confirm-btn" @click="saveItemsOrder" :disabled="isSaving">
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

.items-added-page {
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
	background-color: #9ca3af;
}

/* Each item is now a card */
.item-row {
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

.item-row:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-text-draggable {
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

.item-text {
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

.item-icon {
	width: 1.4rem;
	height: 1.4rem;
	flex-shrink: 0;
	opacity: 0.4;
	cursor: move;
}

.icon-btn {
	border: none;
	background: transparent;
	cursor: pointer;
	padding: 0.1rem;
	flex-shrink: 0;
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