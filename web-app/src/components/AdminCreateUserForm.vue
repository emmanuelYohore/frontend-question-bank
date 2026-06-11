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
  role: string
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
  role: ""
});

const options = ref([
  { text: 'Utilisateur', value: 'user' },
  { text: 'Administrateur', value: 'admin' },
])

//fonction pour s'inscrire
const register = async () => {
  loading.value = true;

  try {
    const response = await fetch("http://localhost:8000/api/v1/users", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        name: formRegister.value.name,
        surname: formRegister.value.surname,
        email: formRegister.value.email,
        password: formRegister.value.password,
        role: formRegister.value.role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Erreur lors de la création de l'utilisateur");
      return;
    }
    alert("Utilisateur créer avec succès")
    router.push("/admin-gestion-users")

    formRegister.value = {
      name: "",
      surname: "",
      email: "",
      password: "",
      role: ""
    };
  } catch (error) {
    alert("Erreur lors de l'inscription");
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
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

      <h1>Créer un utilisateur</h1>

      <form @submit.prevent="register">
        <div class="form-group">
          <label for="nom">*Nom</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faUser" />
            <input type="text" id="nom" v-model="formRegister.name" placeholder="Nom" min="3" maxlength="50" required />
          </div>
          <p>{{ formRegister.name.length }}/50</p>
        </div>

        <div class="form-group">
          <label for="prenom">*Prénom</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faUser" />
            <input type="text" id="prenom" v-model="formRegister.surname" placeholder="Prénom" min="3" maxlength="50"
              required />
          </div>
          <p>{{ formRegister.surname.length }}/50</p>
        </div>

        <div class="form-group">
          <label for="email">*Email</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faEnvelope" />
            <input type="email" id="email" v-model="formRegister.email" placeholder="Ex : user@gmail.com " required />
          </div>
        </div>

        <div class="form-group">
          <label for="password">*Mot de passe</label>
          <div class="input-field">
            <FontAwesomeIcon :icon="faLock" />
            <input :type="showPassword ? 'text' : 'password'" v-model="formRegister.password"
              placeholder="Mot de passe (minimum 6 caractères)" min="6" required />
            <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" class="toggle-password"
              @click="togglePasswordVisibility" />
          </div>
        </div>

        <div class="form-group">
          <label>*Rôle :</label>
          <select v-model="formRegister.role" required>
            <option value="">--- Choisir un rôle ---</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>
        <button type="submit" class="submit-btn" :disabled="!isSubmit">
          {{ loading ? "Chargement..." : "Créer un compte" }}
        </button>
      </form>
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
  background-color: #EFEFEF;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
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
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #4a7dde;
}


</style>
