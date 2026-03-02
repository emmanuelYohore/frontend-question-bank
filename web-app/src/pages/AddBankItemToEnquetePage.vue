<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref } from "vue";

onMounted(async () => {
  await loadData();
});

interface BankItem {
  id: number;
  user_id: number;
  name: string;
  archiver: boolean;
}

interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  archiver: boolean;
}

const bankItems = ref<BankItem[]>([]);
const storeAuth = useAuthStore();
const enquetes = ref<Enquete[]>([]);
const userId = storeAuth.user?.id;
const loading = ref(true);
const bankItemIds = ref([]);
const enqueteId = ref();

const isSelectAll = computed(() => {
  return enqueteId.value !== null && bankItemIds.value.length > 0;
});

const getAllEnqueteForUser = async () => {
  loading.value = true;
  await fetch(`http://localhost:8000/api/v1/users/${userId}/enquetes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      enquetes.value = data;
      loading.value = false;

      console.log(enquetes.value);
    })
    .catch((error) => console.error("Error:", error));
};

const getAllBankItemForUser = async () => {
  loading.value = true;
  await fetch(`http://localhost:8000/api/v1/users/${userId}/bank-items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      bankItems.value = data;
      loading.value = false;

      console.log(bankItems.value);
    })
    .catch((error) => console.error("Error:", error));
};

const loadData = async () => {
  loading.value = true;
  try {
    await Promise.all([getAllEnqueteForUser(), getAllBankItemForUser()]);
  } finally {
    loading.value = false;
  }
};

const addBankItemsToEnquete = async () => {
  loading.value = true;
  await fetch(
    `http://localhost:8000/api/v1/users/${userId}/enquetes/${enqueteId.value}/bank-items`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        bank_item_ids: bankItemIds.value,
      }),
    },
  )
    .then((response) => response.json())
    .then((data) => {
      alert("Les banques d'items ont bien été ajouté");
      console.log(data);
      bankItemIds.value = [];
      loading.value = false;
    })
    .catch((error) => console.error("Error:", error));
};
</script>

<template>
  <div class="my-bank-items">
    <h1>Mes Enquêtes</h1>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-if="enquetes.length == 0" class="empty-state">
      <p>Pas d'enquêtes</p>
      <router-link to="/create-enquete" class="btn-create"
        >Créer une enquête</router-link
      >
    </div>

    <div v-else class="bank-items-container">
      <div
        v-for="enquete in enquetes"
        :key="enquete.id"
        class="bank-item-card"
      >
        <router-link :to="`/enquete/${enquete.id}`" class="bank-item-link">
          <h3>{{ enquete.title }}</h3>
          <p class="bank-status" :class="{ archived: enquete.archiver }">
            {{ enquete.archiver ? "Archivée" : "Active" }}
          </p>
        </router-link>
        <input
          type="radio"
          id="checkbox"
          :value="enquete.id"
          v-model="enqueteId"
        />
      </div>
    </div>
  </div>

  <!-- banque items -->

  <div class="my-bank-items">
    <h1>Mes banques d'items</h1>

    <div v-if="loading" class="loading">
      <p>Chargement...</p>
    </div>

    <div v-if="bankItems.length == 0" class="empty-state">
      <p>Pas de banques d'items</p>
      <router-link to="/create-item" class="btn-create"
        >Créer des items</router-link
      >
    </div>

    <div v-else class="bank-items-container">
      <div v-for="bankItem in bankItems" :key="bankItem.id" class="bank-item-card">
        <router-link :to="`/item/${bankItem.id}`" class="bank-item-link">
          <h3>{{ bankItem.name }}</h3>
          <p class="bank-status" :class="{ archived: bankItem.archiver }">
            {{ bankItem.archiver ? "Archivée" : "Active" }}
          </p>
        </router-link>
        <input
          type="checkbox"
          id="checkbox"
          :value="bankItem.id"
          v-model="bankItemIds"
        />
      </div>
    </div>
  </div>

  <button type="button" :disabled="!isSelectAll" @click="addBankItemsToEnquete">
    {{ loading ? "En cours..." : "Valider" }}
  </button>
</template>

<style scoped></style>
