<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import NavigationBar from "@/components/NavigationBar.vue";

const router = useRouter();

onMounted(async () => {
  await loadData();
});

interface BankItem {
  id: string;
  user_id: string;
  name: string;
  archived: boolean;
}

interface Item {
  id: string;
  question: string;
  obligatoire: boolean;
  archived: boolean;

}

const items = ref<Item[]>([]);
const storeAuth = useAuthStore();
const bankItems = ref<BankItem[]>([]);
const userId = storeAuth.user?.id;
const loading = ref(true);
const itemIds = ref<string[]>([]);
const bankItemId = ref();
const associatedItemIds = ref<string[]>([]);

const isSelectAll = computed(() => {
  return bankItemId.value !== null && itemIds.value.length > 0;
});

const getAllBankForUser = async () => {
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

const getAllItemForUser = async () => {
  loading.value = true;
  await fetch(`http://localhost:8000/api/v1/users/${userId}/items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storeAuth.token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      items.value = data;
      loading.value = false;

      console.log(items.value);
    })
    .catch((error) => console.error("Error:", error));
};

const loadData = async () => {
  loading.value = true;
  try {
    await Promise.all([getAllBankForUser(), getAllItemForUser()]);
  } finally {
    loading.value = false;
  }
};

const getItemsForBank = async (bankId: string) => {
  if (!bankId) return;
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${userId}/bank-items/${bankId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storeAuth.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des items de la banque");
    }

    const data = await response.json();
    // data.items should be an array of items associated to the bank
    associatedItemIds.value = Array.isArray(data.items)
      ? data.items.map((i: any) => i.id)
      : [];
    // ensure associated items are checked in the selection
    itemIds.value = Array.from(new Set([...itemIds.value, ...associatedItemIds.value]));
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(bankItemId, async (newVal) => {
  if (!newVal) {
    associatedItemIds.value = [];
    itemIds.value = [];
    return;
  }

  await getItemsForBank(newVal as string);
});

const addItemsToBank = async () => {
  loading.value = true;
  await fetch(
    `http://localhost:8000/api/v1/users/${userId}/bank-items/${bankItemId.value}/items`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${storeAuth.token}`,
      },
      body: JSON.stringify({
        item_ids: itemIds.value,
      }),
    },
  )
    .then((response) => response.json())
    .then((data) => {
      alert("Les items ont bien été ajouté");
      console.log(data);
      itemIds.value = [];
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
      <h2 class="page-title">Ajouter des items à une banque</h2>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else class="two-col">
      <div class="col">
        <h3 class="col-title">Mes banques d'items</h3>
        <div class="select-label">Sélectionner une banque</div>

        <div class="list-box" :class="{ 'list-box-empty': bankItems.length === 0 }">
          <div v-if="bankItems.length === 0" class="empty">Pas de banques</div>
          <div v-else class="rows">
            <label v-for="bankItem in bankItems" :key="bankItem.id" class="row-item">
              <input
                type="radio"
                :value="bankItem.id"
                v-model="bankItemId"
                :disabled="bankItem.archived"
                class="radio"
              />
              <span class="row-label">{{ bankItem.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="col col-right">
        <h3 class="col-title col-title-right">Mes items</h3>
        <div class="select-label">Sélectionner des items</div>

        <div class="list-box" :class="{ 'list-box-empty': items.length === 0 }">
          <div v-if="items.length === 0" class="empty">Pas d'items</div>
          <div v-else class="rows">
            <label v-for="item in items" :key="item.id" class="row-item">
              <input
                type="checkbox"
                :value="item.id"
                v-model="itemIds"
                :disabled="item.archived || associatedItemIds.includes(item.id)"
                class="checkbox"
              />
              <span class="row-label">{{ item.question }}</span>
              <span
                v-if="item.archived"
                class="badge badge-archived"
                title="Item archivé"
              >
                Archivé
              </span>
              <span
                v-else-if="associatedItemIds.includes(item.id)"
                class="badge badge-associated"
                title="Item déjà dans la banque"
              >
                Déjà dans la banque
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button
        class="btn-valider"
        type="button"
        :disabled="!isSelectAll || loading"
        @click="addItemsToBank"
      >
        {{ loading ? "En cours..." : "Valider" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
   font-family: 'Arial', sans-serif;
   font-size: 14px;
}
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
  font-size: 14px;
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
  font-size: 14px;
}

.page-title {
  flex: 1;
  font-size: 14px;
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
  font-size: 14px;
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
  font-size: 14px;
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
  font-size: 14px;
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
  font-size: 14px;
  color: #111827;
  line-height: 1.2;
}

.badge {
  margin-left: 0.8rem;
  padding: 0.15rem 0.45rem;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
}

.badge-archived {
 background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;

}

.badge-associated {
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
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
  font-size: 14px;
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
    font-size: 14px;
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
