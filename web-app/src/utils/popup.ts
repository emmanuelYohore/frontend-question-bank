import { type PopupType, usePopupStore } from '@/stores/popup'

export const notify = (message: string, type: PopupType = 'info') => {
  const popup = usePopupStore()
  popup.showPopup(message, type)
}
