<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  currentQuestion: string
}>()

const emit = defineEmits<{
  confirm: [newPayload: string]
  cancel: []
}>()

const newQuestion = ref(props.currentQuestion)

const handleConfirm = () => {
  if (!newQuestion.value.trim()) return
  emit('confirm', newQuestion.value.trim())
}
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <h3>Modifier la question</h3>

      <input
        v-model="newQuestion"
        type="text"
        placeholder="Nouvelle question..."
        @keyup.enter="handleConfirm"
      />

      <div class="actions">
        <button class="btn-cancel" @click="emit('cancel')">Annuler</button>
        <button class="btn-confirm" @click="handleConfirm">Confirmer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>

