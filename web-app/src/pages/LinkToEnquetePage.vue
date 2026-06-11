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
    alert("Ce lien ne redirige pas vers une enquête, ou l'enquête a été archivée ou supprimée. Veuillez entrer un autre.")
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
  <div class="page">
    <header class="page-header">
       <button class="back-button" @click="$router.back()">
          <span class="back-circle">&#8592;</span>
          <span>Retour</span>
        </button>
      <h1 class="page-title">Commencer une enquête</h1>
      <div class="header-spacer"></div>
    </header>

    <main class="page-main">
      <div class="card">
        <form @submit.prevent="goToUrl" class="url-form">
          <input
            v-model="url"
            type="url"
            class="url-input"
            placeholder="Entrez l'url de l'enquête"
            required
          />
          <button type="submit" class="submit-btn">Allez</button>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  background-color: #f5f5f5;
  font-family: 'arial', sans-serif;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: #fff;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  color: #1f2937;
}

.back-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.7rem;
  height: 2.7rem;
  border: 2px solid #2d2d2d;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
}


.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-spacer {
  width: 80px; /* équilibre le back-btn */
}

/* ── Main ── */
.page-main {
  display: flex;
  justify-content: center;
  padding: 60px 24px;
  background: #fff
}

/* ── Card ── */
.card {
  background: #fff;
  border-radius: 12px;
box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;  padding: 48px 40px;
  width: 100%;
  max-width: 900px;
}

/* ── Form ── */
.url-form {
  display: flex;
  align-items: center;
  gap: 20px;
}

.url-input {
  flex: 1;
  height: 52px;
  padding: 0 22px;
  border: 1.5px solid #1a1a1a;
  border-radius: 999px;
  font-size: 15px;
  color: #1a1a1a;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
  background: #fff;
}

.url-input::placeholder {
  color: #b0b0b0;
}

.url-input:focus {
  border-color: #5b8ef0;
}

.submit-btn {
  height: 52px;
  padding: 0 40px;
  background: #5b8ef0;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #4a7de0;
}

.submit-btn:active {
  background: #3a6dd0;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .page-header {
    padding: 16px 20px;
  }

  .card {
    padding: 32px 20px;
  }

  .url-form {
    flex-direction: column;
    gap: 14px;
  }

  .url-input,
  .submit-btn {
    width: 100%;
  }
}
</style>

