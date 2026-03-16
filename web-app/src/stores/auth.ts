import { defineStore } from 'pinia'
import {  ref } from 'vue'

export interface User {
  id?: number
  name: string
  surname: string
  email: string
  //password?: string
}

export const useAuthStore = defineStore('auth', () => {

const token = ref<string | null>(localStorage.getItem('access-token'))
const user = ref<User | null>(null)

const getToken = () => {
  return token.value
}

const setToken = (newToken: string) => {
  token.value = newToken
  localStorage.setItem('access-token', newToken)
}

const setUser = (newUser: User) => {
  user.value = newUser
}

const clearAuth = () => {
  token.value = null
  user.value = null
  localStorage.removeItem('access-token')
}

  return { 
    token,
    user,
    getToken,
    setToken,
    setUser,
    clearAuth,
    }
})