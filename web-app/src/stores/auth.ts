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
  const userId = ref<string | null>(localStorage.getItem('user-id'))

  // user uniquement en mémoire
  const user = ref<User | null>(null)

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
    localStorage.setItem('user-id', id)
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    userId.value = null
    localStorage.removeItem('access-token')
        localStorage.removeItem('user-id')
  }



  return {
    token,
    user,
    userId,
    getToken,
    setToken,
    setUser,
    clearAuth,
    setUserId
  }
})
