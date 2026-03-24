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
  <navigation-bar class="hidden-nav" />
  <div class="page-wrapper">
    <div class="header-row">
      <button class="back-btn" @click="router.back()">
        <span class="back-circle">&#8592;</span>
        Retour
      </button>
      <h2 class="page-title">Ajouter des banques à une enquête</h2>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else class="two-col">
      <div class="col">
        <h3 class="col-title">Mes enquêtes</h3>
        <div class="select-label">Sélectionner une enquête</div>

        <div class="list-box" :class="{ 'list-box-empty': enquetes.length === 0 }">
          <div v-if="enquetes.length === 0" class="empty">Pas d'enquêtes</div>
          <div v-else class="rows">
            <label v-for="enquete in enquetes" :key="enquete.id" class="row-item">
              <input type="radio" :value="enquete.id" v-model="enqueteId" class="radio" />
              <span class="row-label">{{ enquete.title }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="col col-right">
        <h3 class="col-title col-title-right">Mes banques</h3>
        <div class="select-label">Sélectionner des banques</div>

        <div class="list-box" :class="{ 'list-box-empty': bankItems.length === 0 }">
          <div v-if="bankItems.length === 0" class="empty">Pas de banques d'items</div>
          <div v-else class="rows">
            <label v-for="bankItem in bankItems" :key="bankItem.id" class="row-item">
              <input type="checkbox" :value="bankItem.id" v-model="bankItemIds" class="checkbox" />
              <span class="row-label">{{ bankItem.name }}</span>
            </label>
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
.hidden-nav {
  display: none;
}

.page-wrapper {
  max-width: 1150px;
  margin: 1.2rem auto;
  padding: 0 2.2rem 2.4rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1.8rem;
  margin-bottom: 2.2rem;
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
  font-size: 2.1rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  transform: translateX(-3.9rem);
  margin: 0;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.two-col {
  display: flex;
  gap: 5.4rem;
  align-items: flex-start;
}

.col {
  flex: 1;
}

.col-right {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.col-title {
  font-size: 2.35rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.col-title-right {
  text-align: right;
  width: 100%;
}

.select-label {
  width: 100%;
  max-width: 360px;
  height: 52px;
  border: 1px solid #4b5563;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  font-size: 2.2rem;
  margin-bottom: 1.1rem;
  background: #f7f7f7;
}

.col-right .select-label {
  margin-left: auto;
}

.list-box {
  width: 100%;
  max-width: 360px;
  min-height: 356px;
  max-height: 356px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 1rem 1.2rem;
}

.col-right .list-box {
  margin-left: auto;
}

.list-box-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  color: #6c757d;
  font-size: 1rem;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.row-item {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  min-height: 48px;
  cursor: pointer;
}

.row-label {
  font-size: 1.95rem;
  color: #111827;
  line-height: 1.2;
}

.radio,
.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6b4cbf;
  flex-shrink: 0;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-valider {
  width: 260px;
  padding: 0.72rem 1rem;
  background-color: #5b8ee6;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.35rem;
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

@media (max-width: 1200px) {
  .page-title,
  .col-title,
  .select-label,
  .row-label {
    font-size: clamp(1.1rem, 2.3vw, 1.9rem);
  }

  .two-col {
    gap: 2rem;
  }
}

@media (max-width: 900px) {
  .header-row {
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .page-title {
    transform: none;
    text-align: left;
    width: 100%;
  }

  .two-col {
    flex-direction: column;
    gap: 1.4rem;
  }

  .col-right .select-label,
  .col-right .list-box {
    margin-left: 0;
  }

  .col-title-right {
    text-align: left;
  }
}
</style>
