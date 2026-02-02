import { defineStore } from 'pinia'
import {  ref } from 'vue'

export interface User {
  id?: number
  name: string
  surname: string
  email: string
  password?: string
}

export const useAuthStore = defineStore('auth', () => {

const token = ref<string | null>(localStorage.getItem('access-token'))
const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

const setToken = (newToken: string) => {
  token.value = newToken
  localStorage.setItem('access-token', newToken)
}

const setUser = (newUser: User) => {
  user.value = newUser
  localStorage.setItem('user', JSON.stringify(newUser))
}

const clearAuth = () => {
  token.value = null
  user.value = null
  localStorage.removeItem('access-token')
  localStorage.removeItem('user')
}

  return { 
    token,
    user,
    setToken,
    setUser,
    clearAuth,
    }
})