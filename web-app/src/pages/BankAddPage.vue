<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

interface BankItem {
	id: number
	name: string
}

const route = useRoute()
const router = useRouter()
const storeAuth = useAuthStore()

const enqueteId = route.params.enqueteId
const bankItems = ref<BankItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Récupère les banques associées à l'enquête
const getBanksAssociatedToEnquete = async () => {
	loading.value = true
	error.value = null

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${storeAuth.token}`,
				},
			}
		)

		if (!response.ok) {
			throw new Error('Erreur lors de la recuperation des banques')
		}

		const data = await response.json()
		bankItems.value = data.bank_items
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
	} finally {
		loading.value = false
	}
}

// Supprime une banque de l'enquête
const removeBankFromEnquete = async (bankItemId: number) => {
	if (!confirm("Etes-vous sur de vouloir supprimer la banque de cette enquete ?")) {
		return
	}

	try {
		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}/bank-items/detach`,
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
		alert('Impossible de supprimer la banque de l\'enquete')
	}
}

const saveBankItemsOrder = async () => {
	loading.value = true
	error.value = null

	try {
		const orderedIds = bankItems.value.map((b) => b.id)

		const response = await fetch(
			`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteId}/bank-items/order`,
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
			throw new Error(errData?.error || 'Erreur lors de la sauvegarde de l\'ordre des banques')
		}

		await getBanksAssociatedToEnquete()
		alert('Ordre sauvegardé avec succès')
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
		console.error(err)
		alert(error.value)
	} finally {
		loading.value = false
	}
}

const goBack = () => {
	router.push({ name: 'enquete-detail', params: { enqueteId } })
}

onMounted(async() => {
	await getBanksAssociatedToEnquete()
})
</script>

<template>
	<div class="banks-added-page">
		<div class="header-row">
			<button class="back-btn" @click="goBack">
				<span class="back-circle">&#8592;</span>
				<span>Retour</span>
			</button>
			<h1 class="page-title">banques ajoutées</h1>
		</div>

		<div v-if="loading" class="loading">Chargement...</div>
		<div v-else-if="error" class="error">{{ error }}</div>


		<ul v-else class="banks-list">

				<draggable v-model="bankItems" :animation="150" item-key="id" @end="saveBankItemsOrder">
			<li v-for="bank in bankItems" :key="bank.id" class="bank-row">
				<span class="bank-text">{{ bank.name }}</span>
				<button class="icon-btn" @click="removeBankFromEnquete(bank.id)" title="Supprimer">
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

.banks-added-page {
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

.banks-list {
	list-style: disc;
	padding-left: 2.4rem;
	margin: 0;
}

.bank-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
}

.bank-text {
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
	width: 1.8rem;
	height: 1.8rem;
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