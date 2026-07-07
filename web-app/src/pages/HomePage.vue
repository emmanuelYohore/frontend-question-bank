<script setup lang="ts">
import { useRouter } from 'vue-router';
import NavigationBar from '@/components/NavigationBar.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
</script>

<template>
  <NavigationBar />

  <div v-if="authStore.isLoading" class="loading">
    Chargement...
  </div>

  <div v-else class="home-container">
    <div class="cards-container">

      <div class="card">
        <div class="card-image">
          <img src="../assets/img/item.png" alt="Items" />
        </div>
        <button class="card-button" @click="navigateTo('create-item')">
          Créer un item
        </button>
      </div>

      <div class="card">
        <div class="card-image">
          <img src="../assets/img/banque.png" alt="Banque" />
        </div>
        <button class="card-button" @click="navigateTo('create-bank-item')">
          Créer une banque d'items
        </button>
      </div>

      <div class="card">
        <div class="card-image">
          <img src="../assets/img/enquete.jpg" alt="Enquête" />
        </div>
        <button class="card-button" @click="navigateTo('create-enquete')">
          Créer une enquête
        </button>
      </div>

      <div class="card">
        <div class="card-image">
          <img src="../assets/img/enquete.jpg" alt="ItemToBank" />
        </div>
        <button class="card-button" @click="navigateTo('add-item-to-bank')">
          Ajouter des items à une banque d'items
        </button>
      </div>

      <div class="card">
        <div class="card-image">
          <img src="../assets/img/enquete.jpg" alt="BankToEnquete" />
        </div>
        <button class="card-button" @click="navigateTo('add-bank-to-enquete')">
          Ajouter des banques d'items à une enquête
        </button>
      </div>

      <div class="card" v-if="authStore.user?.role === 'admin'">
        <div class="card-image">
          <img src="../assets/img/admin.png" alt="Admin" />
        </div>
        <button class="card-button" @click="navigateTo('admin-gestion-users')">
          Gérer les utilisateurs
        </button>

        <div class="card-image">
          <img src="../assets/img/admin.png" alt="Admin" />
        </div>
        <button class="card-button" @click="navigateTo('admin-gestion-enquetes')">
          Gérer les enquêtes
        </button>

        <div class="card-image">
          <img src="../assets/img/admin.png" alt="Admin" />
        </div>
        <button class="card-button" @click="navigateTo('admin-gestion-items')">
          Gérer les items
        </button>

        <div class="card-image">
          <img src="../assets/img/admin.png" alt="Admin" />
        </div>
        <button class="card-button" @click="navigateTo('admin-gestion-banks')">
          Gérer les banques d'items
        </button>
      </div>

      

    </div>
  </div>
</template>

 
 <style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.home-container {
  padding: 3rem 2rem;
  background-color: white;
  min-height: calc(100vh - 80px);
}

/* Conteneur des cards */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Card */
.card {
  background-color: white;
  height: 400px;
  width:350px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 18px rgba(0,0,0,0.15);
}

/* Image */
.card-image {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Bouton */
.card-button {
  background-color: #5b9ceb;
  color: white;
  border: none;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.25s ease;
  width: 100%;
}

.card-button:hover {
  background-color: #4a8bd6;
}

/* Responsive */
@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}

 </style>