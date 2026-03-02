<script setup lang="ts">
import { router } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const storeAuth = useAuthStore();

interface FormRegister {
  name: string;
  surname: string;
  email: string;
  password: string;
}

const loading = ref(false);

const isSubmit = computed(() => {
  return formRegister.value !== null;
});

const formRegister = ref<FormRegister>({
  name: "",
  surname: "",
  email: "",
  password: "",
});

const register = async () => {
  await fetch("http://localhost:8000/api/v1/auth/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: formRegister.value.name,
      surname: formRegister.value.surname,
      email: formRegister.value.email,
      password: formRegister.value.password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        storeAuth.setToken(data.access_token);
        if (data.user) {
          storeAuth.setUser(data.user);
        }
        console.log(data);
        router.push("/home");
      }
      formRegister.value = {
        name: "",
        surname: "",
        email: "",
        password: "",
      };
    })
    .catch((error) => console.error("Error:", error));
};

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="container">
    <div class="form-box">
      <div class="logo">
        <img src="../assets/img/logo.png" alt="Logo" />
      </div>

      <h1>Créer un compte</h1>

      <form @submit.prevent="register">
        <div class="form-group">
          <label for="nom">Nom</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faUser" />
            <input
              type="text"
              id="nom"
              v-model="formRegister.name"
              placeholder="Nom"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="prenom">Prénom</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faUser" />
            <input
              type="text"
              id="prenom"
              v-model="formRegister.surname"
              placeholder="Prénom"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faEnvelope" />
            <input
              type="email"
              id="email"
              v-model="formRegister.email"
              placeholder="Ex : user@gmail.com "
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faLock" />
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formRegister.password"
              placeholder="Mot de passe"
              required
            />
            <FontAwesomeIcon
              :icon="showPassword ? faEyeSlash : faEye"
              class="toggle-password"
              @click="togglePasswordVisibility"
            />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isSubmit">
          {{ loading ? "Chargement..." : "Créer un compte" }}
        </button>
      </form>

      <p class="login-link">
        Vous avez déjà un compte ?
        <router-link to="/login">Se connecter</router-link>
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
  background-color: #e5e5e5;
}

.form-box {
  width: 600px;
  padding: 40px 50px;
  background-color: #fff;
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
  background-color: #f5f5f5;
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
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #4a7dde;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #333;
}

.login-link a {
  color: #5a8dee;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
