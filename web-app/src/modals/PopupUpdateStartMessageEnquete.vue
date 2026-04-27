<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  currentStartMessage: string
}>()

const emit = defineEmits<{
  confirm: [newPayload: string]
  cancel: []
}>()

const newStartMessage = ref(props.currentStartMessage)
const startMessageLength = computed(() => newStartMessage.value.length)
const handleConfirm = () => {
  if (!newStartMessage.value.trim()) return
  emit('confirm', newStartMessage.value.trim())
}
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="modal">
      <h3>Modifier le message de début</h3>

      <textarea 
        v-model="newStartMessage"
        type="text"
        placeholder="Nouveau message de début..."
        @keyup.enter="handleConfirm"
        @keydown.escape="emit('cancel')"
        autofocus
        maxlength="800">
      </textarea>
          <p class="char-count">{{ startMessageLength }}/800</p>

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
  font-family: 'Inter', sans-serif;
}

textarea {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  resize: none;
  overflow-wrap: anywhere;
  word-break: break-word;
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
</style>

