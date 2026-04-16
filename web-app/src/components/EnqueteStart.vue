<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Extract URL from route parameter - supports both old route format and new survey URL format
const enqueteUrl = computed(() => {
  // New route: /survey/:url(.*) -> use 'url' param directly
  if (route.params.url) {
    return (route.params.url as string).split('/').pop() || '';
  }
  // Old route: /enquete-start/:enqueteStartId
  const id = route.params.enqueteStartId as string;
  return id ? id.split('/').pop() : '';
});

// Generate unique session ID
const generateSessionId = (): string => {
  return crypto.randomUUID?.() || `session-${Date.now()}-${Math.random()}`;
};

interface FormatReponse {
  id?: number;
  type: string;
}

interface ModaliteReponse {
  id?: number;
  intitule?: string | null;
  v1?: string | null;
  v2?: string | null;
  format_reponse?: FormatReponse;
}

interface Item {
  id?: number;
  question: string;
  obligatoire: boolean;
  format_reponse?: FormatReponse | null;
  modalite_reponses?: ModaliteReponse[];
}

interface BankItem {
  id: number;
  name: string;
  archived: boolean;
  items?: Item[];
}

interface Enquete {
  id?: number;
  title: string;
  description: string;
  start_message: string;
  end_message: string;
  url_enquete?: string;
  archived: boolean;
  bank_items?: BankItem[];
}

interface Response {
  [itemId: number]: {
    modaliteReponseId?: number;
    modaliteReponseIds?: number[];
    valeurTexte?: string;
    valeurEvn?: string;
    [key: string]: any;
  };
}

const enquete = ref<Enquete | null>(null);
const bankItemsEnquete = ref<BankItem[]>([]);
const responses = ref<Response>({});
const repondantId = ref<number | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);
const submitting = ref(false);
const success = ref(false);

onMounted(() => {
  const sessionId = sessionStorage.getItem('repondant_session_id') || generateSessionId();
  sessionStorage.setItem('repondant_session_id', sessionId);
  
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

    // Create repondant session after fetching enquete
    await createRepondantSession();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement de l\'enquête';
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * Create anonymous repondant session
 */
const createRepondantSession = async () => {
  if (!enquete.value?.id) return;

  try {
    const sessionId = sessionStorage.getItem('repondant_session_id') || generateSessionId();
    const response = await fetch('http://localhost:8000/api/v1/repondants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        enquete_id: enquete.value.id,
        ip_address: await getClientIp(),
        user_agent: navigator.userAgent,
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
  } catch (err) {
    console.error('Error creating repondant session:', err);
    error.value = 'Erreur lors de l\'initialisation de la session';
  }
};

/**
 * Get client IP address - simplified version
 */
const getClientIp = async (): Promise<string> => {
  // Try to get real IP from ipify (non-blocking, timeout after 2s)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch {
    // Timeout or error - use fallback
  }
  
  // Fallback: use a placeholder
  return 'anonymous';
};

/**
 * Update response value
 */
const updateResponse = (itemId: number, fieldName: string, value: any, isQcm: boolean = false) => {
  if (!responses.value[itemId]) {
    responses.value[itemId] = {};
  }
  
  if (isQcm && fieldName === 'modaliteReponseIds') {
    if (!responses.value[itemId].modaliteReponseIds) {
      responses.value[itemId].modaliteReponseIds = [];
    }
    
    const ids = responses.value[itemId].modaliteReponseIds!;
    const modaliteId: number = value.id;
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

    success.value = true;
    setTimeout(() => {
      sessionStorage.removeItem('repondant_session_id');
      sessionStorage.removeItem('repondant_id');
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi des réponses';
    console.error('Error:', err);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="enquete-container">
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
    <div v-else-if="enquete" class="survey-form">
      <!-- Header -->
      <div class="survey-header">
        <h1>{{ enquete.title }}</h1>
        <p class="description">{{ enquete.description }}</p>
        <div v-if="enquete.start_message" class="start-message">
          {{ enquete.start_message }}
        </div>
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
.enquete-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
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

.survey-header {
  margin-bottom: 40px;
  text-align: center;
}

.survey-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 15px;
  font-size: 16px;
}

.start-message {
  background-color: #f9f9f9;
  padding: 15px;
  border-left: 4px solid #007bff;
  margin-top: 15px;
  border-radius: 4px;
}

.survey-content {
  margin-bottom: 40px;
}

.bank-item-section {
  margin-bottom: 30px;
}

.bank-item-name {
  font-size: 20px;
  color: #444;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.item-card {
  background-color: #f9f9f9;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.item-header {
  margin-bottom: 15px;
}

.question {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #d00;
  margin-right: 5px;
}

.response-area {
  margin-top: 15px;
}

.text-input {
  width: 100%;
  padding: 10px;
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
  margin-top: 30px;
}

.submit-btn {
  padding: 12px 40px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

