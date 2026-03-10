import { api } from './api'

const TOKEN_KEY = 'lifeos_token'

export interface User {
  id: number
  email: string
  name: string | null
}

export const authService = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  signup: (email: string, name: string, password: string) =>
    api.post<{ access_token: string }>('/auth/signup', { email, name, password }),

  signin: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/signin', { email, password }),

  me: () => api.get<User>('/auth/me'),
}
