<!-- <script setup lang="ts">
import { ref } from 'vue'

interface UserData {
  name: string
  surname: string
  email: string
  password: string
  role: string
}

const userform = ref<UserData>({
  name: '',
  surname: '',
  email: '',
  password: '',
  role: 'user',
})

const submitForm = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userform.value),
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()
    console.log('User created:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

</script>

<template>
<form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="nom">*Nom</label>
          <div class="input-field">
            <input
              type="text"
              id="nom"
              v-model="formRegister.name"
              placeholder="Nom"
              min="3"
              maxlength="150"
              required
            />
          </div>
          <p>{{  formRegister.name.length }}/150</p>
        </div>

        <div class="form-group">
          <label for="prenom">*Prénom</label>
          <div class="input-field">
            <input
              type="text"
              id="prenom"
              v-model="formRegister.surname"
              placeholder="Prénom"
              min="3"
              maxlength="150"
              required
            />
          </div>
          <p>{{  formRegister.surname.length }}/150</p>
        </div>

        <div class="form-group">
          <label for="email">*Email</label>
          <div class="input-field">
            <input
              type="email"
              id="email"
              v-model="formRegister.email"
              placeholder="Ex : user@gmail.com "
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">*Mot de passe</label>
          <div class="input-field">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formRegister.password"
              placeholder="Mot de passe"
              min="6"
              required
            />
            <FontAwesomeIcon
              :icon="showPassword ? faEyeSlash : faEye"
              class="toggle-password"
              @click="togglePasswordVisibility"
            />        
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isSubmit">
          {{ loading ? "Chargement..." : "Créer un compte" }}
        </button>
      </form>
</template>

<style scoped>

</style>
 -->
