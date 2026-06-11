import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id?: string
  name: string
  surname: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {

  const token = ref<string | null>(localStorage.getItem('access-token'))
  const user = ref<User | null>(null)
  const userId = ref<string | null>(null)
  const isLoading = ref(false)         // ← nouveau

  const getToken = () => token.value

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('access-token', newToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const setUserId = (id: string) => {
    userId.value = id
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    userId.value = null
    localStorage.removeItem('access-token')
  }

  const fetchUserInfo = async () => {
    if (!token.value) return null

    isLoading.value = true             // ← début chargement
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setUserId(userData.id)
        return userData
      } else {
        clearAuth()
        return null
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error)
      return null
    } finally {
      isLoading.value = false           
    }
  }

  return {
    token, user, userId, isLoading,
    getToken, setToken, setUser, clearAuth, setUserId, fetchUserInfo
  }
})