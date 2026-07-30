<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  currentRole: string
}>()

const emit = defineEmits<{
  confirm: [newPayload: string]
  cancel: []
}>()

const newRole = ref(props.currentRole)
const options = ref([
  { text: 'Utilisateur', value: 'user' },
  { text: 'Administrateur', value: 'admin' },
])
const handleConfirm = () => {
  if (!newRole.value.trim()) return
  emit('confirm', newRole.value.trim())
}
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')"  @keyup.enter="handleConfirm"
        @keydown.escape="emit('cancel')">
    <div class="modal">
      
      <h3>Modifier le rôle</h3>
        <label>*Rôle :</label>
          <select v-model="newRole" required>
            <option value="">--- Choisir un rôle ---</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>     
        
      <div class="actions">
        <button class="btn-cancel" @click="emit('cancel')">Annuler</button>
        <button class="btn-confirm" @click="handleConfirm">Confirmer</button>
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

h3{
  margin-bottom: 1rem;
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
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
z-index: 1000;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  background: #E73F1D;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm {
  background: #5A93E8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
</style>

