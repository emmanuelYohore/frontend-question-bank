<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  currentV1: string
}>()

const emit = defineEmits<{
  confirm: [newPayload: string]
  cancel: []
}>()

const newV1 = ref(props.currentV1)

const handleConfirm = () => {
  if (!newV1.value.trim()) return
  emit('confirm', newV1.value.trim())
}
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="modal">
      <h3>Modifier la valeur 1</h3>

      <input
        v-model="newV1"
        type="text"
        placeholder="Nouvelle valeur 1..."
        @keyup.enter="handleConfirm"
        @keydown.escape="emit('cancel')"
        autofocus
      />

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

