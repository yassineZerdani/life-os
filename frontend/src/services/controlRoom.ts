import { api } from './api'
import type {
  ControlRoomSummary,
  ControlRoomFull,
  Alert,
  Recommendation,
  Forecast,
} from '../types/controlRoom'

export const controlRoomService = {
  getSummary: () => api.get<ControlRoomSummary>('/control-room/summary'),
  getAlerts: () => api.get<Alert[]>('/control-room/alerts'),
  getRecommendations: (limit = 5) =>
    api.get<Recommendation[]>(`/control-room/recommendations?limit=${limit}`),
  getForecast: (months = 6) =>
    api.get<Forecast>(`/control-room/forecast?months=${months}`),
  getFull: () => api.get<ControlRoomFull>('/control-room/full'),
}
