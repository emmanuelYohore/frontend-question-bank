<!-- src/pages/ForgotPasswordPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { API_V1_URL } from '@/config/api'

const email   = ref('')
const loading = ref(false)
const success = ref(false)
const error   = ref('')

const submit = async () => {
  loading.value = true
  error.value   = ''

  try {
    const res = await fetch(`${API_V1_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message || 'Une erreur est survenue.'
      return
    }

    success.value = true
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
      <h1>Mot de passe oublié</h1>

      <div v-if="success" class="success-msg">
        Un lien de réinitialisation a été envoyé à <strong>{{ email }}</strong>.
        Vérifiez votre boîte mail.
      </div>

      <template v-else>
        <p class="subtitle">
          Saisissez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </p>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label for="email">*Email</label>
            <div class="input-field">
              <FontAwesomeIcon :icon="faEnvelope" />
              <input
                type="email"
                id="email"
                v-model="email"
                placeholder="Ex : user@gmail.com"
                required
              />
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="submit-btn" :disabled="loading || !email">
            {{ loading ? 'Envoi en cours...' : 'Envoyer le lien' }}
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
.container {
  width: 100%; height: 100vh;
  display: flex; justify-content: center; align-items: center;
  background-color: white;
}
.form-box {
  width: 600px; padding: 40px 50px;
  background-color: #efefef;
  box-shadow: 0 0 20px rgba(0,0,0,.1);
  border-radius: 12px;
}
h1 { text-align: center; font-size: 24px; font-weight: 600;
     margin-bottom: 16px; color: #333; }
.subtitle { text-align: center; color: #666;
            font-size: 14px; margin-bottom: 28px; }
.form-group { margin-bottom: 20px; }
label { display: block; font-size: 14px; font-weight: bold;
        margin-bottom: 8px; color: #333; }
.input-field {
  display: flex; align-items: center;
  background: white; border-radius: 8px; padding: 12px 15px;
}
.input-field input {
  flex: 1; border: none; background: transparent;
  outline: none; font-size: 14px; color: #333; padding: 1%;
}
.submit-btn {
  width: 100%; padding: 14px;
  background-color: #5a8dee; color: white;
  border: none; border-radius: 8px;
  font-size: 16px; cursor: pointer;
  transition: background-color .3s ease; margin-top: 10px;
}
.submit-btn:hover { background-color: #4a7dde; }
.submit-btn:disabled { background-color: #a0c4f7; cursor: not-allowed; }
.success-msg {
  background: #e6f4ea; border: 1px solid #a8d5b5;
  color: #2d6a4f; border-radius: 8px;
  padding: 16px; text-align: center; margin-bottom: 20px;
}
.error-msg { color: #e53e3e; font-size: 13px; margin-bottom: 10px; }
.back-link { text-align: center; margin-top: 20px; font-size: 14px; }
.back-link a { color: #5a8dee; text-decoration: none; }
.back-link a:hover { text-decoration: underline; }
</style>