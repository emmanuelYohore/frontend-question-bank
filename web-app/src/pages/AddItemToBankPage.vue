<script setup lang="ts">

import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

onMounted(async() => {
  await loadData()
})

interface BankItem {
  id: number
  user_id: number
  name: string
  archiver: boolean
}

interface Item {
  id: number
  question: string
  obligatoire : boolean 
}

const items = ref<Item[]>([])
const storeAuth = useAuthStore()
const bankItems = ref<BankItem[]>([])
const userId = storeAuth.user?.id
const loading = ref(true)
const itemIds = ref<Item[]>([])
const bankItemId = ref<BankItem>()

const isSelectAll = computed(() => {
 return bankItemId.value !== null && itemIds.value.length > 0
});

const getAllBankForUser = async () => {  
    
  loading.value = true
await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`,{
  
  method: "GET",
  headers:{
    "Content-Type": "application/json",
   'Authorization': `Bearer ${storeAuth.token}`,
  },
})
.then(response => response.json())
.then(data => {
  bankItems.value = data
  loading.value = false

  console.log(bankItems.value)
 
})
.catch(error => console.error('Error:', error))
}

const getAllItemForUser = async () => {  
  
  loading.value = true
await fetch(`http://localhost:8000/api/v1/users/${userId}/items`,{
  
  method: "GET",
  headers:{
    "Content-Type": "application/json",
   'Authorization': `Bearer ${storeAuth.token}`,
  },
})
.then(response => response.json())
.then(data => {
  items.value = data
  loading.value = false

  console.log(items.value)
 
})
.catch(error => console.error('Error:', error))
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([getAllBankForUser(), getAllItemForUser()])
  } finally {
    loading.value = false
  }
}

const addItemsToBank = async () => { 
  loading.value = true
  await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items/${bankItemId.value}/items`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        item_ids: itemIds.value,
       
      }),
    })
    .then(response => response.json())
    .then(data => {
      alert('Les items ont bien été ajouté')
      console.log(data);
      itemIds.value = [];
      loading.value = false
     
    })
    .catch(error => console.error('Error:', error))
  }


 </script>
 
 <template>
    <div class="my-bank-items">
    <h1>Mes banques</h1>

     <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-if="bankItems.length == 0" class="empty-state">
      <p>Pas de banques</p>
      <router-link to="/create-bank-item" class="btn-create">Créer une banque d'items</router-link>
    </div>

    <div v-else class="bank-items-container">
      <div v-for="bankItem in bankItems" :key="bankItem.id" class="bank-item-card">
        <router-link :to="`/bank-item/${bankItem.id}`" class="bank-item-link">
          <h3>{{ bankItem.name }}</h3>
          <p class="bank-status" :class="{ 'archived': bankItem.archiver }">
            {{ bankItem.archiver ? 'Archivée' : 'Active' }}
          </p>
        </router-link>
         <input type="radio" id="checkbox" :value="bankItem.id" v-model="bankItemId"/>
      </div>
    </div>
  </div>

  <!-- items -->

  <div class="my-bank-items">
    <h1>Mes items</h1>

     <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-if="items.length == 0" class="empty-state">
      <p>Pas d'items</p>
      <router-link to="/create-item" class="btn-create">Créer des items</router-link>
    </div>

    <div v-else class="bank-items-container">
      <div v-for="item in items" :key="item.id" class="bank-item-card">
        <router-link :to="`/item/${item.id}`" class="bank-item-link">
          <h3>{{ item.question }}</h3>
          <p class="bank-status" :class="{ 'obligatoire': item.obligatoire }">
            Obligatoire : {{ item.obligatoire ? 'Oui' : 'Non' }}
          </p>
        </router-link>
        <input type="checkbox" id="checkbox" :value="item.id" v-model="itemIds" />      
      </div>     
    </div>
  </div>

  <button type="button" :disabled="!isSelectAll" @click=addItemsToBank>Enregistrer</button>
 </template>
 
 <style scoped>

 </style>
 