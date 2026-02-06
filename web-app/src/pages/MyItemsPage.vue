<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'


onMounted(() => {
  getAllBankForUser()
})

interface BankItem {
  id: number
  user_id: number
  name: string
  archiver: boolean
}

const storeAuth = useAuthStore()
const bankItems = ref<BankItem[]>([])
const userId = storeAuth.user?.id

const getAllBankForUser = async () => await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`,{
  method: "GET",
  headers:{
    "Content-Type": "application/json",
   'Authorization': `Bearer ${storeAuth.token}`,
  },
})
.then(response => response.json())
.then(data => {
  bankItems.value = data
  console.log(bankItems.value)
 
})
.catch(error => console.error('Error:', error))

</script>

<template>

  <h1>Mes items</h1>

  <div v-if="bankItems.length == 0">
    <p>Pas d'items</p>
  </div>

  <div v-else>
    <div v-for="bankItem in bankItems" :key="bankItem.id">
      {{ bankItem.name }}
    </div>

    <div>
      <router-link to="/create-item">Créer des items</router-link>
    </div>
</div>
 
</template>

<style scoped>

</style>
