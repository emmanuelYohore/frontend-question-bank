<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import PopupAddBankCreateToEnquete from '@/modals/PopupAddBankCreateToEnquete.vue';

const authStore = useAuthStore();

const name = ref('');
const archived = ref(false);
const mode = ref("systematique");
const loading = ref(false)
const showPopup = ref(false)
const createdBankId = ref('')
const valueBankNameCreated = ref('')  

/**
 * fonction pour créer une banque d'item
 */
const createBankItem = async () => { 
  loading.value = true;
  await fetch("http://localhost:8000/api/v1/bank-items", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${authStore.token}`,
    },
    body: JSON.stringify({
      name: name.value,
      archived: archived.value,
      mode: mode.value
    }),
  })
    .then(response => response.json())
    .then(data => {
      createdBankId.value = data.bankItem.id
      valueBankNameCreated.value = name.value  
      showPopup.value = true

      console.log(data);
      name.value = ''  
      loading.value = false;    
    })
    .catch(error => console.error('Error:', error))
}
</script>

<template>
  <div class="form-wrapper">
    <div class="form-card">
      <form @submit.prevent="createBankItem()">
        <div class="form-group">
          <label for="name">*Nom :</label>
          <input 
            type="text" 
            v-model="name" 
            placeholder="Entrez un nom" 
            maxlength="255"
            :required="true"
          >
          <p>{{ name.length }}/255</p>
        </div>
        
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Chargement...' : 'Créer' }}
        </button>
      </form>
    </div>

    <PopupAddBankCreateToEnquete
      v-if="showPopup"
      :bank-item-id="createdBankId"
      :bank-item-name="valueBankNameCreated"
      @close="showPopup = false"
      @validated="showPopup = false"
    />
  </div>
</template>

<style scoped>
 * {
   margin: 0;
   padding: 0;
   background-color: white;
   font-family: 'Arial', sans-serif;
 }
.form-wrapper {
  max-width: 500px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #5b9aff;
}

.form-group input::placeholder {
  color: #aaa;
}

.btn-submit {
  padding: 12px 24px;
  background-color: #5b9aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.btn-submit:hover {
  background-color: #4a89e8;
}
</style>