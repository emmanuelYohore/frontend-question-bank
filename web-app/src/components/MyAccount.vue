<script lang="ts" setup>
import { useAuthStore, type User } from "@/stores/auth";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PopupUpdateUserInfo from "./PopupUpdateUserInfo.vue";

const router = useRouter();
const storeAuth = useAuthStore();
const userId = storeAuth.user?.id;
const loading = ref(false);
const user = ref<User | null>(null);

// État des 3 popups
const showPopupName = ref(false);
const showPopupSurname = ref(false);
const showPopupEmail = ref(false);

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
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

// Popup Nom
const openPopupName = () => {
  showPopupName.value = true;
};

const closePopupName = () => {
  showPopupName.value = false;
};

const confirmPopupName = async (payload: { value: string }) => {
  if (!payload.value.trim()) return;
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ name: payload.value }),
      }
    );

    if (!response.ok) throw new Error();
    if (user.value) user.value.name = payload.value;
    showPopupName.value = false;
  } catch (error) {
    console.error("Error:", error);
  }
};

// Popup Prénom
const openPopupSurname = () => {
  showPopupSurname.value = true;
};

const closePopupSurname = () => {
  showPopupSurname.value = false;
};

const confirmPopupSurname = async (payload: { value: string }) => {
  if (!payload.value.trim()) return;
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ surname: payload.value }),
      }
    );

    if (!response.ok) throw new Error();
    if (user.value) user.value.surname = payload.value;
    showPopupSurname.value = false;
  } catch (error) {
    console.error("Error:", error);
  }
};

// Popup Email
const openPopupEmail = () => {
  showPopupEmail.value = true;
};

const closePopupEmail = () => {
  showPopupEmail.value = false;
};

const confirmPopupEmail = async (payload: { value: string }) => {
  if (!payload.value.trim()) return;
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storeAuth.token}`,
        },
        body: JSON.stringify({ email: payload.value }),
      }
    );

    if (!response.ok) throw new Error();
    if (user.value) user.value.email = payload.value;
    showPopupEmail.value = false;
  } catch (error) {
    console.error("Error:", error);
  }
};
</script>

<template>
  <div class="my-account-container">
    <div v-if="loading">
      <p>Chargement...</p>
    </div>
    <div v-else class="account-content">
      <div class="header-section">
        <button class="back-button" @click="goBack">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Retour</span>
        </button>
        <h1 class="page-title">Mon compte</h1>
      </div>

      <div class="info-section">
        <div class="info-row">
          <div class="label-group">
            <label class="label">Nom :</label>
            <span class="value">{{ user?.name }}</span>
          </div>
          <button class="modify-button" @click="openPopupName">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
        </div>

        <div class="info-row">
          <div class="label-group">
            <label class="label">Prénom :</label>
            <span class="value">{{ user?.surname }}</span>
          </div>
          <button class="modify-button" @click="openPopupSurname">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
        </div>

        <div class="info-row">
          <div class="label-group">
            <label class="label">Email :</label>
            <span class="value">{{ user?.email }}</span>
          </div>
          <button class="modify-button" @click="openPopupEmail">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modifier</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Popup pour Nom -->
    <PopupUpdateUserInfo
      :visible="showPopupName"
      title="Modifier le nom"
      :value="user?.name || ''"
      @close="closePopupName"
      @confirm="confirmPopupName"
    />

    <!-- Popup pour Prénom -->
    <PopupUpdateUserInfo
      :visible="showPopupSurname"
      title="Modifier le prénom"
      :value="user?.surname || ''"
      @close="closePopupSurname"
      @confirm="confirmPopupSurname"
    />

    <!-- Popup pour Email -->
    <PopupUpdateUserInfo
      :visible="showPopupEmail"
      title="Modifier l'email"
      :value="user?.email || ''"
      @close="closePopupEmail"
      @confirm="confirmPopupEmail"
    />
  </div>
</template>

<style scoped>
.my-account-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 18px;
  color: #666;
}

.account-content {
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 60px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  color: #333;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #666;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.info-section {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 40px;
  max-width: 700px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.label {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  min-width: 80px;
}

.value {
  font-size: 16px;
  color: #666;
  min-width: 200px;
}

.modify-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.modify-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.edit-icon {
  width: 18px;
  height: 18px;
}
</style>
