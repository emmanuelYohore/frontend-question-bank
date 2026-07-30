<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  bankName: string
  maxItems: number
  currentCount: number | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  confirm: [count: number]
  cancel: []
}>()

const selectedCount = ref(props.currentCount || props.maxItems)

watch(() => props.currentCount, (newVal) => {
  selectedCount.value = newVal || props.maxItems
})

const handleConfirm = () => {
  if (selectedCount.value > 0 && selectedCount.value <= props.maxItems) {
    emit('confirm', selectedCount.value)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="handleCancel">
    <div class="modal">
      <h3>Nombre d'items aléatoires</h3>
      <p class="bank-name">Banque: <strong>{{ bankName }}</strong></p>
      
      <div class="info-section">
        <p>Sélectionnez le nombre d'items à sélectionner aléatoirement</p>
        <p class="max-items">Nombre maximum disponible: <strong>{{ maxItems }}</strong></p>
      </div>

      <div class="input-section">
        <label for="items-count">Nombre d'items :</label>
        <div class="input-wrapper">
          <button class="btn-minus" @click="selectedCount = Math.max(1, selectedCount - 1)" type="button">−</button>
          <input
            id="items-count"
            v-model.number="selectedCount"
            type="number"
            :min="1"
            :max="maxItems"
            @keyup.enter="handleConfirm"
            @keydown.escape="handleCancel"
          />
          <button class="btn-plus" @click="selectedCount = Math.min(maxItems, selectedCount + 1)" type="button">+</button>
        </div>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="handleCancel">Annuler</button>
        <button class="btn-confirm" @click="handleConfirm" :disabled="selectedCount < 1 || selectedCount > maxItems">Confirmer</button>
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

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h3 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.2rem;
}

.bank-name {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.info-section {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.info-section p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

.max-items {
  color: #1976d2;
  font-weight: 500;
}

.input-section {
  margin-bottom: 2rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #1976d2;
}

.btn-minus,
.btn-plus {
  width: 36px;
  height: 36px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  color: #333;
}

.btn-minus:hover,
.btn-plus:hover {
  border-color: #1976d2;
  background: #f0f7ff;
  color: #1976d2;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.btn-cancel {
  flex: 1;
  background: #E73F1D;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.btn-cancel:hover {
  background: #d93010;
}

.btn-confirm {
  flex: 1;
  background: #5A93E8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.btn-confirm:hover:not(:disabled) {
  background: #4a7fd0;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
