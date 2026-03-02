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
  <div>
    <form @submit.prevent="createEnquete()">
      <label for="title">*Titre:</label>
      <input
        type="text"
        v-model="enquete.title"
        placeholder="Titre"
        :required="true"
      />
      <label for="description">*Description:</label>
      <input
        type="text"
        v-model="enquete.description"
        placeholder="Description"
        :required="true"
      />
      <label for="start_message">*Message de début:</label>
      <input
        type="text"
        v-model="enquete.start_message"
        placeholder="Message de début"
        :required="true"
      />
      <label for="end_message">*Message de fin:</label>
      <input
        type="text"
        v-model="enquete.end_message"
        placeholder="Message de fin"
        :required="true"
      />

      <button type="submit" :disabled="!isSubmit">
        {{ loading ? "Chargement..." : "Valider" }}
      </button>
    </form>
  </div>
  <router-link to="/my-enquetes">Voir mes enquetes</router-link>
</template>

<style scoped></style>
