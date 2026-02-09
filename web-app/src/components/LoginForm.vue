<script setup lang="ts">

import { router } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue'

const storeAuth = useAuthStore();

const email = ref('');
const password = ref('');

const login = async () =>{ await fetch("http://localhost:8000/api/v1/auth/login",{
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
        email.value = '',
        password.value = ''
  })
.catch(error => console.error('Error:', error))
}


</script>


<template>

<div class="bg-gray-50 dark:bg-gray-900">
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="https://sphere-inserm.fr/fr" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img class="w-33 h-33 mr-2" src="https://sphere-inserm.fr/themes/custom/spheretheme/logo.svg" alt="logo">
          SPHERE-INSERM    
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Se connecter
              </h1>
              <form @submit.prevent="login" class="space-y-4 md:space-y-6">
                  <div>
                      <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                      <input type="email" v-model="email" minlength="6" maxlength="30" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-#3b82f6-500" placeholder="name@company.com" :required="true">
                  </div>
      
                  <div>
                      <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mot de passe</label>
                      <input type="password" v-model="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :required="true">
                  </div>
                  
                  <button type="submit" class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Se connecter</button>
                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                      Vous n'avez pas de compte ? <router-link to="/register" class="font-medium text-blue-500 hover:underline dark:text-blue-500">S'inscrire</router-link> 
                  </p>  
              </form>
          </div>
      </div>
  </div>
</div>

</template>

<style scoped>
</style>