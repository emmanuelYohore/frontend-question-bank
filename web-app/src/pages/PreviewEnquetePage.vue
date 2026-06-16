<script lang="ts" setup>
import PopupStartMessageEnquete from '@/modals/PopupStartMessageEnquete.vue';
import PopupEndMessageEnquete from '@/modals/PopupEndMessageEnquete.vue';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const storeAuth = useAuthStore();

const enqueteId = route.query.enqueteId as string;

interface FormatReponse {
  id?: string;
  type: string;
}

interface ModaliteReponse {
  id?: string;
  intitule?: string | null;
  min_value?: string | null;
  max_value?: string | null;
  format_reponse?: FormatReponse;
}

interface Item {
  id?: string;
  question: string;
  min_case_to_check: number | null;
  max_case_to_check: number | null;
  name_variable_export: string;
  obligatoire: boolean;
  format_reponse?: FormatReponse | null;
  modalite_reponses?: ModaliteReponse[];
  bankItemId?: string;
}

interface BankItem {
  id: string;
  name: string;
  mode: string;
  archived: boolean;
  items?: Item[];
}

interface Enquete {
  id?: string;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  url_enquete?: string;
  archived: boolean;
  bank_items?: BankItem[];
}

interface Response {
  [itemId: string]: {
    modaliteReponseId?: string;
    modaliteReponseIds?: string[];
    valeurTexte?: string;
    valeurEvn?: string;
    [key: string]: any;
  };
}

const enquete = ref<Enquete | null>(null);
const bankItemsEnquete = ref<BankItem[]>([]);
const responses = ref<Response>({});
const error = ref<string | null>(null);
const loading = ref(false);
const showStartModal = ref(false);
const showEndModal = ref(false);
const previewStarted = ref(false);

// Pagination
const ITEMS_PER_PAGE = 5;
const currentPage = ref(0);

const allItems = computed(() => {
  const items: Item[] = [];
  for (const bankItem of bankItemsEnquete.value) {
    for (const item of bankItem.items || []) {
      items.push({ ...item, bankItemId: bankItem.id });
    }
  }
  return items;
});

const totalPages = computed(() => Math.ceil(allItems.value.length / ITEMS_PER_PAGE));

const currentItems = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  return allItems.value.slice(start, start + ITEMS_PER_PAGE);
});

const isLastPage = computed(() => currentPage.value === totalPages.value - 1);
const isFirstPage = computed(() => currentPage.value === 0);

const getCheckedCount = (itemId: string): number => {
  return responses.value[itemId]?.modaliteReponseIds?.length || 0;
};

const isCheckboxDisabled = (itemId: string, modaliteId: string, maxCheck: number | null): boolean => {
  if (maxCheck === null) return false;
  const ids = responses.value[itemId]?.modaliteReponseIds || [];
  const isChecked = ids.includes(modaliteId);
  return !isChecked && ids.length >= maxCheck;
};

const isItemValid = (item: Item): boolean => {
  const response = responses.value[item.id!];

  if (item.format_reponse?.type === 'qcm' && item.min_case_to_check !== null) {
    const count = response?.modaliteReponseIds?.length || 0;
    if (count > 0 && count < item.min_case_to_check) return false;
  }

  if (item.obligatoire) {
    if (item.format_reponse?.type === 'texte') {
      if (!response?.valeurTexte || response.valeurTexte.trim() === '') return false;
    } else if (item.format_reponse?.type === 'qcm') {
      const count = response?.modaliteReponseIds?.length || 0;
      if (count === 0) return false;
      if (item.min_case_to_check !== null && count < item.min_case_to_check) return false;
    } else if (item.format_reponse?.type === 'qcu') {
      if (!response?.modaliteReponseId) return false;
    } else if (item.format_reponse?.type === 'evn') {
      if (!response || response.valeurEvn === undefined || response.valeurEvn === '') return false;
    }
  }

  return true;
};

const isCurrentPageValid = computed(() => {
  for (const item of currentItems.value) {
    if (!isItemValid(item)) return false;
  }
  return true;
});

const isFormValid = computed(() => {
  if (!allItems.value.length) return false;
  for (const item of allItems.value) {
    if (!isItemValid(item)) return false;
  }
  return true;
});

const nextPage = () => {
  if (!isLastPage.value && isCurrentPageValid.value) {
    currentPage.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const prevPage = () => {
  if (!isFirstPage.value) {
    currentPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const updateResponse = (itemId: string, fieldName: string, value: any, isQcm: boolean = false) => {
  if (!responses.value[itemId]) {
    responses.value[itemId] = {};
  }

  if (isQcm && fieldName === 'modaliteReponseIds') {
    if (!responses.value[itemId].modaliteReponseIds) {
      responses.value[itemId].modaliteReponseIds = [];
    }

    const ids = responses.value[itemId].modaliteReponseIds!;
    const modaliteId: string = value.id;
    const isChecked: boolean = value.checked;

    if (isChecked) {
      if (!ids.includes(modaliteId)) ids.push(modaliteId);
    } else {
      const index = ids.indexOf(modaliteId);
      if (index > -1) ids.splice(index, 1);
    }
  } else {
    responses.value[itemId][fieldName] = value;
  }
};

const getEnqueteDetail = async () => {
  if (!enqueteId) {
    error.value = 'Aucune enquête spécifiée pour la prévisualisation.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/users/${storeAuth.userId}/enquetes/${enqueteId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storeAuth.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors du chargement de l'enquête");
    }

    const data: Enquete = await response.json();
    enquete.value = data;
    bankItemsEnquete.value = data.bank_items || [];
    showStartModal.value = true;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement de l\'enquête';
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

const handleStartSurvey = () => {
  showStartModal.value = false;
  previewStarted.value = true;
};

const handleModalClose = () => {
  showStartModal.value = false;
  router.push({ name: 'enquete-detail', params: { enqueteId } });
};

const handleSubmitPreview = () => {
  showEndModal.value = true;
};

const handleEndModalClose = () => {
  showEndModal.value = false;
  router.push({ name: 'enquete-detail', params: { enqueteId } });
};

const goBack = () => {
  router.push({ name: 'enquete-detail', params: { enqueteId } });
};

onMounted(() => {
  getEnqueteDetail();
});
</script>

<template>
  <div class="preview-wrapper">
    <!-- Bannière prévisualisation -->
    <div class="preview-banner">
      <span>Mode prévisualisation — aucune donnée ne sera enregistrée</span>
      <button class="banner-back-btn" @click="goBack">← Retour à l'enquête</button>
    </div>

    <div class="enquete-container">
      <!-- Start Message Modal -->
      <PopupStartMessageEnquete
        :enquete="enquete"
        :isOpen="showStartModal"
        @start="handleStartSurvey"
        @close="handleModalClose"
      />

      <!-- End Message Modal -->
      <PopupEndMessageEnquete
        :enquete="enquete"
        :isOpen="showEndModal"
        @close="handleEndModalClose"
      />

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <p>Chargement de l'enquête...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <!-- Survey Form -->
      <div v-else-if="enquete && previewStarted && !showStartModal && !showEndModal" class="survey-form">
        <!-- Header -->
        <div class="survey-header">
          <h1>Enquête : {{ enquete.title }}</h1>
        </div>

        <!-- Items de la page courante -->
        <div class="survey-content">
          <div v-for="item in currentItems" :key="item.id" class="item-card">
            <div class="item-header">
              <label class="question">
                <span v-if="item.obligatoire" class="required">*</span>
                {{ item.question }}
              </label>
            </div>

            <div class="response-area">
              <!-- Text Format -->
              <input
                v-if="item.format_reponse?.type === 'texte'"
                type="text"
                placeholder="Entrez votre réponse"
                :value="responses[item.id!]?.valeurTexte || ''"
                @input="updateResponse(item.id!, 'valeurTexte', ($event.target as HTMLInputElement).value)"
                class="text-input"
              />

              <!-- QCM -->
              <div v-else-if="item.format_reponse?.type === 'qcm'" class="qcm-container">
                <p class="qcm-info">
                  Veuillez sélectionner
                  <strong>entre {{ item.min_case_to_check }} et {{ item.max_case_to_check }}</strong> options
                  <span class="qcm-count">
                    ({{ getCheckedCount(item.id!) }}/{{ item.max_case_to_check }} sélectionnée(s))
                  </span>
                </p>

                <div
                  v-for="modalite in item.modalite_reponses"
                  :key="modalite.id"
                  class="checkbox-item"
                  :class="{ 'checkbox-disabled': isCheckboxDisabled(item.id!, modalite.id!, item.max_case_to_check) }"
                >
                  <input
                    v-if="modalite.id"
                    type="checkbox"
                    :id="`checkbox-${item.id}-${modalite.id}`"
                    :checked="responses[item.id!]?.modaliteReponseIds?.includes(modalite.id) || false"
                    :disabled="isCheckboxDisabled(item.id!, modalite.id!, item.max_case_to_check)"
                    @change="updateResponse(item.id!, 'modaliteReponseIds', { id: modalite.id, checked: ($event.target as HTMLInputElement).checked }, true)"
                  />
                  <label
                    v-if="modalite.id"
                    :for="`checkbox-${item.id}-${modalite.id}`"
                    :class="{ 'label-disabled': isCheckboxDisabled(item.id!, modalite.id!, item.max_case_to_check) }"
                  >
                    {{ modalite.intitule }}
                  </label>
                </div>

                <p
                  v-if="getCheckedCount(item.id!) > 0 && getCheckedCount(item.id!) < (item.min_case_to_check ?? 0)"
                  class="qcm-error"
                >
                  ⚠ Veuillez sélectionner au moins {{ item.min_case_to_check }} option(s).
                  ({{ getCheckedCount(item.id!) }}/{{ item.min_case_to_check }})
                </p>
                <p
                  v-else-if="getCheckedCount(item.id!) >= (item.min_case_to_check ?? 0) && getCheckedCount(item.id!) > 0"
                  class="qcm-success"
                >
                  ✓ Sélection valide
                </p>
              </div>

              <!-- QCU -->
              <div v-else-if="item.format_reponse?.type === 'qcu'" class="qcu-container">
                <div v-for="modalite in item.modalite_reponses" :key="modalite.id" class="radio-item">
                  <label>
                    <input
                      type="radio"
                      :name="`item-${item.id}`"
                      :value="modalite.id"
                      :checked="responses[item.id!]?.modaliteReponseId === modalite.id"
                      @change="updateResponse(item.id!, 'modaliteReponseId', modalite.id)"
                    />
                    {{ modalite.intitule }}
                  </label>
                </div>
              </div>

              <!-- EVN -->
              <div v-else-if="item.format_reponse?.type === 'evn'" class="evn-container">
                <div v-for="modalite in item.modalite_reponses" :key="modalite.id" class="range-item">
                  <div class="range-labels">
                    <span class="label-left">{{ modalite.min_value }}</span>
                    <span class="label-right">{{ modalite.max_value }}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    :value="responses[item.id!]?.valeurEvn || '5'"
                    @input="updateResponse(item.id!, 'valeurEvn', ($event.target as HTMLInputElement).value)"
                    class="range-input"
                  />
                </div>
              </div>

              <!-- Unknown Format -->
              <div v-else class="unknown-format">
                <p>Format non reconnu : {{ item.format_reponse?.type }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="submit-section">
          <div class="pagination-info">
            Page {{ currentPage + 1 }} / {{ totalPages }}
          </div>
          <div class="nav-buttons">
            <button v-if="!isFirstPage" @click="prevPage" class="nav-btn prev-btn">
              Précédent
            </button>

            <button
              v-if="!isLastPage"
              @click="nextPage"
              :disabled="!isCurrentPageValid"
              class="nav-btn next-btn"
            >
              Suivant
            </button>

            <button
              v-if="isLastPage"
              @click="handleSubmitPreview"
              :disabled="!isFormValid"
              class="submit-btn"
            >
              Envoyer (simulation)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

/* ── Bannière ── */
.preview-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #fef3c7;
  border-bottom: 2px solid #f59e0b;
  color: #92400e;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  flex-wrap: wrap;
}

.banner-back-btn {
  margin-left: auto;
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.banner-back-btn:hover {
  background: #d97706;
}

/* ── Container ── */
.preview-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.enquete-container {
  max-width: 800px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  width: 100%;
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
  border-radius: 8px;
}

.loading {
  background-color: #f0f0f0;
  color: #666;
}

.error {
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.survey-form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.survey-header {
  padding: 30px 20px 20px;
  text-align: center;
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
}

.survey-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.survey-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  counter-reset: item-counter;
}

.item-card {
  background-color: #ffffff;
  padding: 20px;
  margin-bottom: 15px;
  border: 3px solid #d0d0d0;
  border-radius: 10px;
  counter-increment: item-counter;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-card:last-child {
  margin-bottom: 20px;
}

.item-header {
  margin-bottom: 15px;
}

.question {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
}

.question::before {
  content: counter(item-counter) '. ';
  font-weight: 600;
}

.qcm-info {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

.qcm-count {
  font-size: 13px;
  color: #666;
  margin-left: 4px;
}

.checkbox-item.checkbox-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.label-disabled {
  cursor: not-allowed;
  color: #999;
}

.qcm-error {
  margin-top: 8px;
  font-size: 13px;
  color: #dc3545;
  font-weight: 500;
}

.qcm-success {
  margin-top: 8px;
  font-size: 13px;
  color: #28a745;
  font-weight: 500;
}

.required {
  color: #d00;
  margin-left: 3px;
}

.response-area {
  margin-top: 15px;
}

.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.qcm-container,
.qcu-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
}

.checkbox-item label,
.radio-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
}

.checkbox-item input,
.radio-item input {
  margin-right: 10px;
  cursor: pointer;
}

.evn-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.range-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.label-left {
  text-align: left;
  font-size: 15px;
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
}

.label-right {
  text-align: right;
  font-size: 15px;
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  display: block;
}

.range-input {
  width: 100%;
  cursor: pointer;
}

.unknown-format {
  color: #d00;
  padding: 10px;
  background-color: #fee;
  border-radius: 4px;
}

/* ── Navigation ── */
.submit-section {
  text-align: center;
  padding: 20px;
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
}

.pagination-info {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.nav-btn {
  padding: 12px 30px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.prev-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.prev-btn:hover {
  background-color: #d1d5db;
}

.next-btn {
  background-color: #5b8ee6;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background-color: #4a7fdb;
}

.next-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn {
  padding: 12px 30px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  background-color: #5b8ee6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #4a7fdb;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>