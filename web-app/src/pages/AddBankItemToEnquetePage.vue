<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import NavigationBar from "@/components/NavigationBar.vue";

const router = useRouter();

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
  return enqueteId.value != null && bankItemIds.value.length > 0;
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
  <navigation-bar />
  <div class="page-wrapper">
    <div class="header-row">
      <button class="back-btn" @click="router.back()">
        <span class="back-circle">&#8592;</span>
        Retour
      </button>
      <h2 class="page-title">Ajouter des banques d'items a une enquete</h2>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else class="two-col">
      <div class="col">
        <h3 class="col-title">Mes Enquetes</h3>
        <div v-if="enquetes.length === 0" class="empty">Pas d'enquetes</div>
        <div v-else class="rows">
          <div v-for="enquete in enquetes" :key="enquete.id" class="row-item">
            <div class="card">
              <span class="card-name">{{ enquete.title }}</span>
              <span class="status" :class="{ archived: enquete.archiver }">
                {{ enquete.archiver ? "Archivee" : "Active" }}
              </span>
            </div>
            <input type="radio" :value="enquete.id" v-model="enqueteId" class="radio" />
          </div>
        </div>
      </div>

      <div class="col col-right">
        <h3 class="col-title col-title-right">Mes banque d'items</h3>
        <div v-if="bankItems.length === 0" class="empty">Pas de banques d'items</div>
        <div v-else class="rows">
          <div v-for="bankItem in bankItems" :key="bankItem.id" class="row-item row-item-right">
            <input type="checkbox" :value="bankItem.id" v-model="bankItemIds" class="checkbox" />
            <div class="card">
              <span class="card-name">{{ bankItem.name }}</span>
              <span class="status" :class="{ archived: bankItem.archiver }">
                {{ bankItem.archiver ? "Archivee" : "Active" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn-valider" type="button" :disabled="!isSelectAll || loading" @click="addBankItemsToEnquete">
        {{ loading ? "En cours..." : "Valider" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 2rem 3rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #1f2937;
  padding: 0;
  white-space: nowrap;
}

.back-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #1f2937;
  border-radius: 50%;
  font-size: 1.2rem;
}

.page-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  transform: translateX(-4rem);
  margin: 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.two-col {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.col {
  flex: 1;
}

.col-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.col-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.2rem 0;
}

.col-title-right {
  text-align: right;
  width: 100%;
}

.empty {
  color: #6c757d;
  font-size: 0.95rem;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.row-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.row-item-right {
  justify-content: flex-end;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180px;
  min-height: 70px;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  gap: 0.2rem;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.status {
  font-size: 0.82rem;
  font-weight: 500;
  color: #27ae60;
}

.status.archived {
  color: #95a5a6;
}

.radio,
.checkbox {
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: #6b4cbf;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.btn-valider {
  padding: 0.75rem 3rem;
  background-color: #5b8ee6;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-valider:hover:not(:disabled) {
  background-color: #4a7fdb;
}

.btn-valider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
