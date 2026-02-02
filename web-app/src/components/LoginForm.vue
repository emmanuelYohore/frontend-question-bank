<script setup lang="ts">

import { router } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue'

const storeAuth = useAuthStore();

const email = ref('');
const password = ref('');

const login = () => fetch("http://localhost:8000/api/v1/auth/login",{
  method: "POST",
  headers:{
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
})
.then(response => response.json())
.then(data => {
  if (data.access_token) {
    localStorage.setItem('access-token',data.access_token)
    storeAuth.setToken(data.access_token)
     console.log( data)
    console.log( storeAuth.token)
    router.push('/home')
    
  }
})
.catch(error => console.error('Error:', error))

</script>

<template>
  <div>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email">
      <input type="password" v-model="password" placeholder="Password">
      <button type="submit">Login</button>    
    </form>   
  </div>
</template>

<style>
</style>