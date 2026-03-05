<script lang="ts" setup>
import { useAuthStore, type User } from "@/stores/auth";
import { onMounted, ref } from "vue";

const storeAuth = useAuthStore();
const userId = storeAuth.user?.id;
const loading = ref(false);
const user = ref<User | null>(null);

onMounted(() => {
  getInfoUser();
});

const getInfoUser = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storeAuth.token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    user.value = await response.json();
    console.log(user.value);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="loading == true">
    <p>Chargement...</p>
  </div>
  <div v-else>
    <p>Nom : {{ user?.name }}</p>
    <p>Prénom : {{ user?.surname }}</p>
    <p>Email : {{ user?.email }}</p>
  </div>
</template>

<style scoped></style>
