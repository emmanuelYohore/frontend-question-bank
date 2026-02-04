<script setup lang="ts">

import { router } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue'

const storeAuth = useAuthStore();

const name = ref('');
const surname = ref('')
const email = ref('');
const password = ref('');

 const register = async () => { await fetch("http://localhost:8000/api/v1/auth/register",{
    method: "POST",
    credentials: "include",
    headers:{
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
            name: name.value,
            surname: surname.value,
            email: email.value,
            password: password.value,
          }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.access_token) {
      storeAuth.setToken(data.access_token)
      if (data.user) {
        storeAuth.setUser(data.user)
      }
      console.log( data)
      router.push('/home')
      
    }
  })
  .catch(error => console.error('Error:', error))
}
</script>

<template>
  <div>
    <form @submit.prevent="register">
      <input type="text" v-model="name" placeholder="Nom" :required="true">
      <input type="text" v-model="surname" placeholder="Prénom" :required="true">
      <input type="email" v-model="email" placeholder="Email" :required="true">
      <input type="password" v-model="password" placeholder="Mot de passe" :required="true">
      <button type="submit">Créer un compte</button>
      <router-link to="/login">Vous avez déjà un compte?</router-link>
    </form>   
  </div>
</template>

<style scoped>
</style>