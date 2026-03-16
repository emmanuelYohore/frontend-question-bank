<script lang="ts" setup>
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  title: string
  value: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { value: string }): void
}>()

const inputValue = ref('')

// Synchroniser la prop avec la value locale
watch(() => props.value, (newValue) => {
  inputValue.value = newValue
}, { immediate: true })

function close() {
  emit('close')
}

function confirm() {
  emit('confirm', { value: inputValue.value })
}
</script>

<template>
  <div v-if="visible" class="popup-overlay" @click.self="close">
    <div class="popup-content">
      <header>
        <h2>{{ title }}</h2>
        <button @click="close">✖</button>
      </header>
      <main>
        <input 
          v-model="inputValue"
          type="text"
          class="form-input"
          @keydown.enter="confirm"
          @keydown.escape="close"
          autofocus
        />
      </main>
      <footer>
        <button @click="close">Annuler</button>
        <button @click="confirm">Confirmer</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  min-width: 300px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

header h2 {
  margin: 0;
  font-size: 18px;
}

header button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
}

header button:hover {
  color: #333;
}

main {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff5722;
  box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

footer button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

footer button:first-child {
  background-color: #f0f0f0;
  color: #333;
}

footer button:first-child:hover {
  background-color: #e0e0e0;
}

footer button:last-child {
  background-color: #ff5722;
  color: white;
}

footer button:last-child:hover {
  background-color: #e64a19;
}
</style>
