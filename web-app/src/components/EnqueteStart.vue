<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const storeAuth = useAuthStore();

const route = useRoute()

const enqueteStartId = route.params.enqueteStartId

interface FormatReponse {
  id?: number 
  type: string
}

interface ModaliteReponse {
  id?: number
  intitule?: string | null
  v1?: string | null
  v2?: string | null
  format_reponse?: FormatReponse
}

interface Item {
  id?: number
  question: string
  obligatoire: boolean
  //archived: boolean
  format_reponse?: FormatReponse | null
  modalite_reponses?: ModaliteReponse[]
}

interface BankItem {
  id: number
  name: string
  archived: boolean
  items?: Item[]
}

interface Enquete {
  id?: number
  title: string
  description: string
  start_message: string
  end_message: string
  url_enquete?: string
  archived: boolean
}

const enquete = ref<Enquete | null>(null)
const bankItems = ref<BankItem[]>([])
const items = ref<Item[]>([])
// const formatReponses = ref<FormatReponse[]>([])
// const modalites = ref<ModaliteReponse[]>([])

const error = ref<string | null>(null)

const loading = ref(false)


onMounted(() => {
  getEnqueteDetailWithBanksAdd()
  getItemDetailWithModalitesAndFormatReponse()
  getAllBankItemDetailWithItems()
})

const getEnqueteDetailWithBanksAdd = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/enquetes/${enqueteStartId}`, {
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
    bankItems.value = data.bank_items

    console.log(`enquete : ${enquete.value}`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const getItemDetailWithModalitesAndFormatReponse = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'item')
    }
    
    const data = await response.json()
    items.value = data

    console.log(items.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Récupère tous les bank items avec leurs items associés pour un userId donné
const getAllBankItemDetailWithItems = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8000/api/v1/users/${storeAuth.user?.id}/bank-items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la banque')
    }
    
    const data = await response.json()
    bankItems.value = data
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

</script>

<template>
    <p>{{ enquete?.title }}</p>
        <div v-for="b in bankItems" :key="b.id">
            <p>{{ b.name }}</p>
            <div v-for="i in b.items" :key="i.id">
                <p>{{ i.question }}</p>
                
                <p>Format: {{ i.format_reponse?.type }}</p>
                
                <div v-if="i.format_reponse?.type === 'texte'">
                    <input type="text" name="text" id="text" placeholder="Entrez votre réponse" />
                </div>
                <div v-else-if="i.format_reponse?.type === 'qcm'">
                    <div v-for="m in i.modalite_reponses" :key="m.id">
                        <label>
                            <input type="checkbox" name="qcm" />
                            {{ m.intitule }}
                        </label>
                    </div>
                </div>
                <div v-else-if="i.format_reponse?.type === 'qcu'">
                    <div v-for="m in i.modalite_reponses" :key="m.id">
                        <label>
                            <input type="radio" name="qcu"/>
                            {{ m.intitule }}
                        </label>
                    </div>
                </div>
                <div v-else-if="i.format_reponse?.type === 'evn'">
                    <div v-for="m in i.modalite_reponses" :key="m.id">
                        <p>
                          {{ m.v1 }} <input type="range" name="evn" list="value"/> {{ m.v2 }}
                        </p>
                    </div>
                </div>
                <div v-else>
                    <p>Type de format inconnu: {{ i.format_reponse?.type }}</p>
                </div>
               
                            
            </div>
        </div>
</template>

