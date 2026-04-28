<script lang="ts" setup>
import PopupStartMessageEnquete from '@/modals/PopupStartMessageEnquete.vue';
import PopupEndMessageEnquete from '@/modals/PopupEndMessageEnquete.vue';
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Extract URL from route parameter - supports both old route format and new survey URL format
const enqueteUrl = computed(() => {
  // New route: /survey/:url(.*) -> use 'url' param directly
  if (route.params.url) {
    return (route.params.url as string).split('/').pop() || '';
  }
 
});

// Generate unique session ID
const generateSessionId = (): string => {
  return crypto.randomUUID?.() || `session-${Date.now()}-${Math.random()}`;
};

interface FormatReponse {
  id?: string;
  type: string;
}

interface ModaliteReponse {
  id?: string;
  intitule?: string | null;
  v1?: string | null;
  v2?: string | null;
  format_reponse?: FormatReponse;
}

interface Item {
  id?: string;
  question: string;
  obligatoire: boolean;
  format_reponse?: FormatReponse | null;
  modalite_reponses?: ModaliteReponse[];
}

interface BankItem {
  id: string;
  name: string;
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
const repondantId = ref<string | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);
const submitting = ref(false);
const success = ref(false);
const showStartModal = ref(false);
const showEndModal = ref(false);
const sessionCreated = ref(false);
const sessionId = ref<string>('');

onMounted(() => {
  const sessionIdStored = sessionStorage.getItem('repondant_session_id') || generateSessionId();
  sessionStorage.setItem('repondant_session_id', sessionIdStored);
  sessionId.value = sessionIdStored;
  
  getEnqueteByUrl();
});

/**
 * Fetch enquete by URL (public access)
 */
const getEnqueteByUrl = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`http://localhost:8000/api/v1/enquetes/by-url/${enqueteUrl.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Enquête non trouvée');
    }

    const data: Enquete = await response.json();
    enquete.value = data;
    bankItemsEnquete.value = data.bank_items || [];

    // Afficher le modal de démarrage
    showStartModal.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement de l\'enquête';
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * Create anonymous repondant session (called when user clicks "Commencer")
 */
const createRepondantSession = async () => {
  if (!enquete.value?.id) return;

  try {
    const response = await fetch('http://localhost:8000/api/v1/repondants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId.value,
        enquete_id: enquete.value.id,
        started_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Repondant creation error:', errorData);
      throw new Error('Erreur lors de la création de la session');
    }

    const data = await response.json();
    repondantId.value = data.repondant.id;
    sessionStorage.setItem('repondant_id', data.repondant.id);
    sessionCreated.value = true;
  } catch (err) {
    console.error('Error creating repondant session:', err);
    error.value = 'Erreur lors de l\'initialisation de la session';
  }
};

/**
 * Update response value
 */
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
      if (!ids.includes(modaliteId)) {
        ids.push(modaliteId);
      }
    } else {
      const index = ids.indexOf(modaliteId);
      if (index > -1) {
        ids.splice(index, 1);
      }
    }
  } else {
    responses.value[itemId][fieldName] = value;
  }
};

/**
 * Check if all required items are answered
 */
const isFormValid = computed(() => {
  if (!bankItemsEnquete.value || bankItemsEnquete.value.length === 0) return false;

  for (const bankItem of bankItemsEnquete.value) {
    if (!bankItem.items) continue;
    for (const item of bankItem.items) {
      if (item.obligatoire) {
        const response = responses.value[item.id!];
        if (!response) return false;

        if (item.format_reponse?.type === 'texte') {
          if (!response.valeurTexte || response.valeurTexte.trim() === '') return false;
        } else if (item.format_reponse?.type === 'qcm') {
          if (!response.modaliteReponseIds || response.modaliteReponseIds.length === 0) return false;
        } else if (item.format_reponse?.type === 'qcu') {
          if (!response.modaliteReponseId) return false;
        } else if (item.format_reponse?.type === 'evn') {
          if (response.valeurEvn === undefined || response.valeurEvn === '') return false;
        }
      }
    }
  }
  return true;
});

/**
 * Submit all responses
 */
const submitResponses = async () => {
  if (!repondantId.value || !enquete.value?.id) {
    error.value = 'Session invalide';
    return;
  }

  submitting.value = true;
  error.value = null;

  try {
    const reponsesToSubmit = [];

    for (const bankItem of bankItemsEnquete.value) {
      if (!bankItem.items) continue;
      for (const item of bankItem.items) {
        const response = responses.value[item.id!];
        
        // Pour QCM, soumettre chaque modalité sélectionnée comme une réponse séparée
        if (item.format_reponse?.type === 'qcm' && response?.modaliteReponseIds) {
          for (const modaliteId of response.modaliteReponseIds) {
            reponsesToSubmit.push({
              repondant_id: repondantId.value,
              enquete_id: enquete.value.id,
              item_id: item.id,
              modalite_reponse_id: modaliteId,
              valeur_texte: null,
              valeur_evn: null,
            });
          }
        } else if (response) {
          // Pour les autres formats
          reponsesToSubmit.push({
            repondant_id: repondantId.value,
            enquete_id: enquete.value.id,
            item_id: item.id,
            modalite_reponse_id: response.modaliteReponseId || null,
            valeur_texte: response.valeurTexte || null,
            valeur_evn: response.valeurEvn || null,
          });
        }
      }
    }

    // Submit each response
    for (const resp of reponsesToSubmit) {
      const submitResponse = await fetch('http://localhost:8000/api/v1/reponses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resp),
      });

      if (!submitResponse.ok) {
        throw new Error(`Erreur lors de l'envoi de la réponse pour l'item ${resp.item_id}`);
      }
    }

    // Mark repondant as completed
    const updateResponse = await fetch(`http://localhost:8000/api/v1/repondants/${repondantId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      console.warn('Warning: Could not mark repondant as completed');
    }

    // Afficher le modal de fin
    showEndModal.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi des réponses';
    console.error('Error:', err);
  } finally {
    submitting.value = false;
  }
};

/**
 * Handle start survey button
 */
/**
 * Handle start survey button - create session and show form
 */
const handleStartSurvey = async () => {
  await createRepondantSession();
  if (sessionCreated.value) {
    showStartModal.value = false;
  }
};

/**
 * Handle start modal close
 */
const handleModalClose = () => {
  showStartModal.value = false;
};

/**
 * Handle end modal close - cleanup and redirect
 */
const handleEndModalClose = () => {
  showEndModal.value = false;
  sessionStorage.removeItem('repondant_session_id');
  sessionStorage.removeItem('repondant_id');
};
</script>

<template>
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
      <p class="loading-detail">Initialisation de votre session...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <!-- Success State -->
    <div v-else-if="success" class="success">
      <h2>{{ enquete?.end_message || 'Merci d\'avoir rempli l\'enquête!' }}</h2>
    </div>

    <!-- Survey Form -->
    <div v-else-if="enquete && sessionCreated && !showStartModal && !showEndModal" class="survey-form">
      <!-- Header -->
      <div class="survey-header">
        <h1>Enquête: {{ enquete.title }}</h1>
        <p class="description">{{ enquete.description }}</p>       
      </div>

      <!-- Bank Items and Questions -->
      <div class="survey-content">
        <div v-for="bankItem in bankItemsEnquete" :key="bankItem.id" class="bank-item-section">
          <h2 class="bank-item-name">{{ bankItem.name }}</h2>

          <div v-for="item in bankItem.items" :key="item.id" class="item-card">
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

              <!-- QCM (Multiple Choice) -->
              <div v-else-if="item.format_reponse?.type === 'qcm'" class="qcm-container">
                <div v-for="modalite in item.modalite_reponses" :key="modalite.id" class="checkbox-item">
                  <input
                    v-if="modalite.id"
                    type="checkbox"
                    :id="`checkbox-${item.id}-${modalite.id}`"
                    :checked="responses[item.id!]?.modaliteReponseIds?.includes(modalite.id) || false"
                    @change="updateResponse(item.id!, 'modaliteReponseIds', { id: modalite.id, checked: ($event.target as HTMLInputElement).checked }, true)"
                  />
                  <label v-if="modalite.id" :for="`checkbox-${item.id}-${modalite.id}`">
                    {{ modalite.intitule }}
                  </label>
                </div>
              </div>

              <!-- QCU (Single Choice) -->
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

              <!-- EVN (Scale/Range) -->
              <div v-else-if="item.format_reponse?.type === 'evn'" class="evn-container">
                <div v-for="modalite in item.modalite_reponses" :key="modalite.id" class="range-item">
                  <div class="range-labels">
                    <span class="label-left">{{ modalite.v1 }}</span>
                    <span class="label-right">{{ modalite.v2 }}</span>
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
                <p>Format non reconnu: {{ item.format_reponse?.type }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="submit-section">
        <button
          @click="submitResponses"
          :disabled="!isFormValid || submitting"
          class="submit-btn"
        >
          {{ submitting ? 'Envoi en cours...' : 'Envoyer' }}
        </button>
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

.enquete-container {
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.loading,
.error,
.success {
  text-align: center;
  padding: 40px 20px;
  border-radius: 8px;
}

.loading {
  background-color: #f0f0f0;
  color: #666;
}

.loading-detail {
  font-size: 13px;
  margin-top: 8px;
  color: #999;
}

.error {
  background-color: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.success {
  background-color: #efe;
  color: #060;
  border: 1px solid #cfc;
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

.description {
  display: none;
}

.survey-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  counter-reset: item-counter;
}

.bank-item-section {
  margin-bottom: 0;
}

.bank-item-name {
  display: none;
}

.item-card {
  background-color: #ffffff;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  counter-increment: item-counter;
}

.item-card:last-child {
  margin-bottom: 20px;
}

.item-header {
  margin-bottom: 15px;
}

.question {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.question::before {
  content: counter(item-counter) ". ";
  font-weight: 600;
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
}

.label-right {
  text-align: right;
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

.submit-section {
  text-align: center;
  padding: 20px;
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
}

.submit-btn {
  width: 150px;
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

