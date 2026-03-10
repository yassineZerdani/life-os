import { api } from './api'
import type { Note } from '../types'

export const notesService = {
  list: (domainId?: number) =>
    api.get<Note[]>(domainId ? `/notes?domain_id=${domainId}` : '/notes'),
  getById: (id: number) => api.get<Note>(`/notes/${id}`),
  create: (data: Partial<Note>) => api.post<Note>('/notes', data),
  update: (id: number, data: Partial<Note>) => api.patch<Note>(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
}
