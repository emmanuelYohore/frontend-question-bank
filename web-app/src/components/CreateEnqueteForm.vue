<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";

interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  archiver: boolean;
}

const authStore = useAuthStore();
const enquete = ref<Enquete>({
  title: "",
  description: "",
  start_message: "",
  end_message: "",
  archiver: false,
});

const loading = ref(false);

const isSubmit = computed(() => {
  return enquete.value !== null;
});

const createEnquete = async () => {
  loading.value = true;
  await fetch("http://localhost:8000/api/v1/enquetes", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authStore.token}`,
    },
    body: JSON.stringify({
      title: enquete.value.title,
      description: enquete.value.description,
      start_message: enquete.value.start_message,
      end_message: enquete.value.end_message,
      archiver: enquete.value.archiver,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Enquête créer avec succès");
      console.log(data);
      loading.value = false;
      enquete.value = {
        title: "",
        description: "",
        start_message: "",
        end_message: "",
        archiver: false,
      };
    })
    .catch((error) => console.error("Error:", error));
};
</script>

<template>
  <div class="form-wrapper">
    <div class="form-card">
      <form @submit.prevent="createEnquete()">
        <div class="form-group">
          <label for="title">Titre :</label>
          <input
            type="text"
            v-model="enquete.title"
            placeholder="Entrez un titre"
            :required="true"
          />
        </div>
        
        <div class="form-group">
          <label for="description">Description :</label>
          <input
            type="text"
            v-model="enquete.description"
            placeholder="Entrez une description"
            :required="true"
          />
        </div>
        
        <div class="form-group">
          <label for="start_message">Message de début :</label>
          <input
            type="text"
            v-model="enquete.start_message"
            placeholder="Entrez un message de début"
            :required="true"
          />
        </div>
        
        <div class="form-group">
          <label for="end_message">Message de fin :</label>
          <input
            type="text"
            v-model="enquete.end_message"
            placeholder="Entrez un message de fin"
            :required="true"
          />
        </div>

        <button type="submit" :disabled="!isSubmit" class="btn-submit">
          {{ loading ? "Chargement..." : "Créer" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-wrapper {
  max-width: 500px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #5b9aff;
}

.form-group input::placeholder {
  color: #aaa;
}

.btn-submit {
  padding: 12px 24px;
  background-color: #5b9aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.btn-submit:hover:not(:disabled) {
  background-color: #4a89e8;
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
