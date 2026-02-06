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
        name.value = '',
        surname.value = '',
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
                  Créer un compte
              </h1>
              <form @submit.prevent="register" class="space-y-4 md:space-y-6">
                <div>
                      <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nom</label>
                      <input type="text" v-model="name" placeholder="" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :required="true">
                  </div>
                  <div>
                      <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prenom</label>
                      <input type="text" v-model="surname" placeholder="" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :required="true">
                  </div>
                  <div>
                      <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                      <input type="email" v-model="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" :required="true">
                  </div>
                  <div>
                      <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mot de passe</label>
                      <input type="password" v-model="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :required="true">
                  </div>
                    
                  <div class="flex items-start">
                                          
                  </div>
                  <button type="submit" class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Créer un compte</button>

                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                      Vous avez déjà un compte ? <router-link to="/login" class="font-medium text-blue-600 hover:underline dark:text-blue-500">se connecter</router-link>
                  </p>
              </form>
          </div>
      </div>
  </div>
</div>

</template>

<style scoped>
</style>