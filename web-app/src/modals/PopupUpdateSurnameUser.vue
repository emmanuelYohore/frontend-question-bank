<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  currentSurname: string
}>()

const emit = defineEmits<{
  confirm: [newPayload: string]
  cancel: []
}>()

const newSurname = ref(props.currentSurname)

const handleConfirm = () => {
  if (!newSurname.value.trim()) return
  emit('confirm', newSurname.value.trim())
}
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="modal">
      <h3>Modifier le prénom</h3>

      <input
        v-model="newSurname"
        type="text"
        placeholder="Nouveau prénom..."
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

