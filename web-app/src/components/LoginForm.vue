<script setup lang="ts">

import { router } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue'

const storeAuth = useAuthStore();

const email = ref('');
const password = ref('');

const login = async () => await fetch("http://localhost:8000/api/v1/auth/login",{
  method: "POST",
  credentials: "include",
  headers:{
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify({
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


</script>

<template>
  <div>
    <form @submit.prevent="login">
      <label for="email">Email:</label>
      <input type="email" v-model="email" placeholder="Email" :required="true">
      <label for="password">Mot de passe:</label>
      <input type="password" v-model="password" placeholder="Mot de passe" :required="true">
      <button type="submit">Se connecter</button>  
      <router-link to="/register">S'inscrire</router-link>  
    </form>   
  </div>
</template>

<style>
</style>