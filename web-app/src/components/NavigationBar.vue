
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

/**
 *fonction pour se déconnecter
*/
const logout = async () => {
  try {
    loading.value = true
    const response = await fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    
    if (response.ok) {
      authStore.clearAuth();
      router.push('/login');
          loading.value = false

    }
  } catch (error) {
    console.error('Error:', error);
  }
};

 </script>
 
 <template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo-section" @click="router.push('/home')">
        <div class="logo">
          <img src="../assets/img/logo.png" alt="Logo" />
        </div>
        <h1 class="app-title">ENQUETE APP</h1>
      </div>

      <!-- Burger -->
      <button class="burger-btn" @click="toggleMenu">
        ☰
      </button>

      <!-- Navigation -->
      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <li>
          <router-link to="/home" class="nav-link">Accueil</router-link>
        </li>
        <li>
          <router-link to="/my-bank-items" class="nav-link">
            Voir mes banques
          </router-link>
        </li>
        <li>
          <router-link to="/my-items" class="nav-link">
            Voir mes items
          </router-link>
        </li>
        <li>
          <router-link to="/my-enquetes" class="nav-link">
            Voir mes enquêtes
          </router-link>
        </li>
        <li>
          <router-link to="/my-account" class="nav-link">
            Mon compte
          </router-link>
        </li>

        <!-- Bouton logout mobile -->
        <li class="mobile-logout">
          <button @click="logout" class="logout-btn">
            {{ loading ? 'Chargement...' : 'Se déconnecter' }}
          </button>
        </li>
      </ul>

      <!-- Logout desktop -->
      <button @click="logout" class="logout-btn desktop-logout">
        {{ loading ? 'Chargement...' : 'Se déconnecter' }}
      </button>
    </div>
  </nav>
</template>
 
 <style scoped>
  * {
   margin: 0;
   padding: 0;
   font-family: 'Arial', sans-serif;
 }
 
.navbar {
  border-radius: 0 0 40px 40px;
  background-color: #FFF1F1;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  overflow: hidden;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;

}

.logo img {
  height: 50px;
  width: auto;

}

.app-title {
  font-family: 'Arial', sans-serif;
  font-size: 1.25rem;
  font-weight: bold;
  color: #000;
  margin: 0;

}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: #000;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.nav-link:hover {
  color:#e74c3c;
  border-bottom-color: #e74c3c;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.burger-btn {
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}

.mobile-logout {
  display: none;
}

/* TABLETTE */
@media (max-width: 1024px) {
  .app-title {
    font-size: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }
  
}

/* MOBILE */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    border-radius: 0 0 20px 20px;
  }

  .navbar-container {
    flex-wrap: wrap;
  }

  .logo img {
    height: 40px;
  }

  .app-title {
    font-size: 0.9rem;
  }

  .burger-btn {
    display: block;
  }

  .desktop-logout {
    display: none;
  }

  .mobile-logout {
    display: block;
    width: 100%;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    width: 100%;
    margin-top: 1rem;
    gap: 1rem;
    text-align: center;
    background: #fff1f1;
    padding: 1rem 0;
  }

  .nav-links.active {
    display: flex;
  }

  .nav-link {
    display: block;
    width: 100%;
    padding: 0.5rem;
  }

  .logout-btn {
    width: 90%;
  }
}

 </style>