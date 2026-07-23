import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PopupType = 'success' | 'error' | 'info'

export const usePopupStore = defineStore('popup', () => {
  const isOpen = ref(false)
  const message = ref('')
  const type = ref<PopupType>('info')

  const showPopup = (text: string, variant: PopupType = 'info') => {
    message.value = text
    type.value = variant
    isOpen.value = true
  }

  const closePopup = () => {
    isOpen.value = false
    message.value = ''
  }

  return {
    isOpen,
    message,
    type,
    showPopup,
    closePopup,
  }
})
