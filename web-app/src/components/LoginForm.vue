<script setup lang="ts">
import { router } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";
import { notify } from '@/utils/popup'
import { API_V1_URL } from '@/config/api'
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const storeAuth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const validePassword = computed(() => {
  return password.value.length >= 6
})

//fonction pour se connecter
const login = async () => {
  loading.value = true;

  try {
    const response = await fetch(`${API_V1_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      notify(data.message || "Identifiants incorrects", 'error');
      loading.value = false;
      return;
    }
    storeAuth.setToken(data.access_token);
    storeAuth.setUser(data.user);
    storeAuth.setUserId(data.user.id);

    router.push("/home");
  } catch (error) {
    console.error("Error:", error);
    notify("Erreur réseau, impossible de contacter le serveur", 'error');
  } finally {
    email.value = "";
    password.value = "";
    loading.value = false;
  }
};

</script>

<template>
  <div class="container">
    <div class="form-box">
      <div class="logo">
        <img src="../assets/img/logo.png" alt="Logo" />
      </div>

      <h1>Se connecter</h1>

      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">*Email</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faEnvelope" />
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Ex : user@gmail.com "
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">*Mot de passe</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faLock" />
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
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

        <button type="submit" class="submit-btn" :disabled="!validePassword" >
          {{ loading ? "Chargement..." : "Se connecter" }}
        </button>
      </form>

      <p class="register-link">
        Vous n'avez pas de compte ?
        <router-link to="/register">S'inscrire</router-link>
      </p>
      <p class="">       
<router-link to="/forgot-password">Mot de passe oublié ?</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
}

.container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

.form-box {
  width: 600px;
  padding: 40px 50px;
  background-color: #efefef;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo img {
  height: 80px;
  border-radius: 8px;
}

h1 {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 12px 15px;
}

.input-field i {
  color: #666;
  font-size: 18px;
  margin-right: 12px;
}

.input-field input {
  padding: 1%;
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.input-field input::placeholder {
  color: #999;
}

.toggle-password {
  cursor: pointer;
  color: #666;
  font-size: 18px;
  margin-left: 10px;
  margin-right: 0;
}

.toggle-password:hover {
  color: #333;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #5a8dee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #4a7dde;
}

.submit-btn:disabled {
  background-color: #a0c4f7;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #333;
}

.register-link a {
  color: #5a8dee;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>