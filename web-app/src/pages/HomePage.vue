<script setup lang="ts">
import { useRouter } from 'vue-router';
import NavigationBar from '@/components/NavigationBar.vue';
 
const router = useRouter();

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
 
 </script>
 
 <template>
  <NavigationBar />
  
  <div class="home-container">
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

      <div class="card">
        <div class="card-image">
          <img src="../assets/img/enquete.jpg" alt="Enquête" />
        </div>
        <button class="card-button" @click="navigateTo('')">
          Commencer une enquête
        </button>
      </div>
    </div>
  </div>
 </template>
 
 <style scoped>
 * {
   margin: 0;
   padding: 0;
   background-color: white;
   font-family: 'Arial', sans-serif;
 }
.home-container {
  padding: 3rem 2rem;
  background-color: white;
  min-height: calc(100vh - 80px);
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-button {
  background-color: #5b9ceb;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;
  width: 100%;
  max-width: 250px;
}

.card-button:hover {
  background-color: #4a8bd6;
}

@media (max-width: 1024px) {
  .cards-container {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .card {
    width: 100%;
    max-width: 350px;
  }
}
 </style>