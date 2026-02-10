<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';
import { router } from '@/router/routes';
import NavigationBar from '@/components/NavigationBar.vue';

const storeAuth = useAuthStore();

onMounted(async () => {
  if (storeAuth.token && !storeAuth.user) {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${storeAuth.token}`,
          'Accept': 'application/json'
        }
      });
      const userData = await response.json();
      if (response.ok) {
        storeAuth.setUser(userData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  }
});

const logout = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        'Authorization': `Bearer ${storeAuth.token}`,
      },
    });
    
    if (response.ok) {
      storeAuth.clearAuth();
      router.push('/login');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

</script>

<template>

  <NavigationBar/>
    
    <div>
      <h1>Bienvenue {{ storeAuth.user?.name }} {{ storeAuth.user?.surname }}</h1>
    <router-link to="/create-bank-item">Créer une banque d'items</router-link>
    <router-link to="/create-item">Créer un item</router-link>

    <router-link to="/my-bank-items">Voir mes banques</router-link><br><br><br>


    <router-link to="/my-items">Voir mes items</router-link>




  </div>
  <button @click="logout">Se déconnecter</button>
  
</template>

<style scoped>

</style>