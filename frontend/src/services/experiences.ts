import { api } from './api'
import type { Experience } from '../types'

export const experiencesService = {
  list: (limit = 50) => api.get<Experience[]>(`/experiences?limit=${limit}`),
  getById: (id: number) => api.get<Experience>(`/experiences/${id}`),
  create: (data: Partial<Experience>) => api.post<Experience>('/experiences', data),
  update: (id: number, data: Partial<Experience>) =>
    api.patch<Experience>(`/experiences/${id}`, data),
  delete: (id: number) => api.delete(`/experiences/${id}`),
}
