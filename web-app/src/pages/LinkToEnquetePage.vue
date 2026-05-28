<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

interface Enquete {
  id?: string
  title: string
  description: string
  start_message: string
  end_message: string
  url_enquete: string
  archived: boolean
}

const enquete = ref<Enquete[]>([])

const storeAuth = useAuthStore()
const url = ref('')

const goToUrl = () => {
  let finalUrl = url.value.trim()

  for (const u of enquete.value) {
    if (finalUrl.includes(u.url_enquete)) {
      window.open(finalUrl, "_blank")
      return
    }
    else{
    alert("Ce lien ne redirige pas vers une enquête, ou l'enquête a été supprimée. Veuillez entrer un autre.")
        return
    }

  }
   
}

const getAllEnquetes = async () => {
  await fetch(`http://localhost:8000/api/v1/enquetes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      enquete.value = data 
    })
    .catch(error => console.error('Error:', error))
}

onMounted(() => {
  getAllEnquetes()
})
</script>

<template>
  <form @submit.prevent="goToUrl">
    <input
      v-model="url"
      type="url"
      placeholder="Entrez une URL"
      required
    />
    <button type="submit">Aller</button>
  </form>
</template>


