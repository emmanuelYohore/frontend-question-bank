<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'


interface Item {
	id: number
	question: string
}

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

const bankItemId = route.params.bankItemId
const items = ref<Item[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * Récupère les items associés à la banque pour un userId
 */
const getItemsAssociatedToBanks = async () => {
	loading.value = true
	error.value = null

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/bank-items/${bankItemId}`,
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
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
	} finally {
		loading.value = false
	}
}

/**
 * Supprime l'association d'un item à la banque
 */
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
	loading.value = true

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/bank-items/${bankItemId}/items/order`,
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
	} catch (err) {
		console.error('Error:', err)
		alert('Impossible de mettre à jour l\'ordre des items')
	} finally {
		loading.value = false
	}
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
		<ul v-else class="items-list">
		<draggable v-model="items" :animation="150" item-key="id" @end="saveItemsOrder">
			<li v-for="item in items" :key="item.id" class="item-row">
				<span class="item-text">{{ item.question }}</span>
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
	</div>
</template>

<style scoped>
* {
	margin: 0;
	padding: 0;
	font-family: 'Arial', sans-serif;
}

.items-added-page {
	max-width: 930px;
	margin: 1rem auto;
	padding: 0 1rem;
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
	width: 2.2rem;
	height: 2.2rem;
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

.items-list {
	list-style: disc;
	padding-left: 2.4rem;
	margin: 0;
}

.item-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
}

.item-text {
	color: #111827;
	font-size: 1.05rem;
}

.icon-btn {
	border: none;
	background: transparent;
	cursor: pointer;
	padding: 0.1rem;
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
	}
}
</style>