import { api } from './api'
import type { Relationship } from '../types'

export const relationshipsService = {
  list: () => api.get<Relationship[]>('/relationships'),
  getById: (id: number) => api.get<Relationship>(`/relationships/${id}`),
  create: (data: Partial<Relationship>) => api.post<Relationship>('/relationships', data),
  update: (id: number, data: Partial<Relationship>) =>
    api.patch<Relationship>(`/relationships/${id}`, data),
  delete: (id: number) => api.delete(`/relationships/${id}`),
}
