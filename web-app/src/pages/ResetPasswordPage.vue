<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { API_V1_URL } from '@/config/api'

const router = useRouter()
const route  = useRoute()

const token           = ref('')
const email           = ref('')
const password        = ref('')
const passwordConfirm = ref('')
const showPassword    = ref(false)
const loading         = ref(false)
const success         = ref(false)
const error           = ref('')

onMounted(() => {
  token.value = route.query.token as string || ''
  email.value = route.query.email as string || ''
})

const passwordsMatch = computed(() =>
  password.value === passwordConfirm.value && password.value.length >= 6
)

const submit = async () => {
  if (!passwordsMatch.value) {
    error.value = 'Les mots de passe ne correspondent pas ou sont trop courts.'
    return
  }

  loading.value = true
  error.value   = ''

  try {
    const res = await fetch(`${API_V1_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        token:                 token.value,
        email:                 email.value,
        password:              password.value,
        password_confirmation: passwordConfirm.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message || 'Une erreur est survenue.'
      return
    }

    success.value = true
    setTimeout(() => router.push('/login'), 3000)
  } catch {
    error.value = 'Erreur réseau, impossible de contacter le serveur.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="form-box">
      <h1>Nouveau mot de passe</h1>

      <div v-if="success" class="success-msg">
        Mot de passe réinitialisé ! Vous allez être redirigé vers la connexion…
      </div>

      <template v-else>
        <form @submit.prevent="submit">
          <div class="form-group">
            <label>*Nouveau mot de passe</label>
            <div class="input-field">
              <FontAwesomeIcon :icon="faLock" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Min. 6 caractères"
                required
              />
              <FontAwesomeIcon
                :icon="showPassword ? faEyeSlash : faEye"
                class="toggle-password"
                @click="showPassword = !showPassword"
              />
            </div>
          </div>

          <div class="form-group">
            <label>*Confirmer le mot de passe</label>
            <div class="input-field">
              <FontAwesomeIcon :icon="faLock" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="passwordConfirm"
                placeholder="Répétez le mot de passe"
                required
              />
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="submit-btn" :disabled="loading || !passwordsMatch">
            {{ loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe' }}
          </button>
        </form>
      </template>

      <p class="back-link">
        <router-link to="/login">← Retour à la connexion</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
*{
  font-family: 'Arial', sans-serif;
}
.container { width:100%; height:100vh; display:flex;
             justify-content:center; align-items:center; background:white; }
.form-box  { width:600px; padding:40px 50px; background:#efefef;
             box-shadow:0 0 20px rgba(0,0,0,.1); border-radius:12px; }
h1         { text-align:center; font-size:24px; font-weight:600;
             margin-bottom:28px; color:#333; }
.form-group { margin-bottom:20px; }
label       { display:block; font-size:14px; font-weight:bold;
              margin-bottom:8px; color:#333; }
.input-field { display:flex; align-items:center; background:white;
               border-radius:8px; padding:12px 15px; }
.input-field input { flex:1; border:none; background:transparent;
                     outline:none; font-size:14px; color:#333; padding:1%; }
.toggle-password { cursor:pointer; color:#666; margin-left:10px; }
.submit-btn { width:100%; padding:14px; background:#5a8dee; color:white;
              border:none; border-radius:8px; font-size:16px;
              cursor:pointer; transition:background .3s; margin-top:10px; }
.submit-btn:hover    { background:#4a7dde; }
.submit-btn:disabled { background:#a0c4f7; cursor:not-allowed; }
.success-msg { background:#e6f4ea; border:1px solid #a8d5b5; color:#2d6a4f;
               border-radius:8px; padding:16px; text-align:center; }
.error-msg   { color:#e53e3e; font-size:13px; margin-bottom:10px; }
.back-link   { text-align:center; margin-top:20px; font-size:14px; }
.back-link a { color:#5a8dee; text-decoration:none; }
</style>