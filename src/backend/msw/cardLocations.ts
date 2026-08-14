// src/backend/msw/cardLocations.ts
// Card locations backend implemented via the MSW-intercepted HTTP adapter

import { httpClient } from '@/api/httpClient'
import type {
  ICardLocationsBackend,
  CardLocation,
  CreateCardLocationPayload,
  UpdateCardLocationPayload,
} from '../types'

export const mswCardLocationsBackend: ICardLocationsBackend = {
  async list(cardId: string): Promise<CardLocation[]> {
    const { data } = await httpClient.get<CardLocation[]>(`/cards/${cardId}/locations`)
    return data
  },

  async create(cardId: string, payload: CreateCardLocationPayload): Promise<CardLocation> {
    const { data } = await httpClient.post<CardLocation>(`/cards/${cardId}/locations`, payload)
    return data
  },

  async update(cardId: string, id: string, payload: UpdateCardLocationPayload): Promise<CardLocation> {
    const { data } = await httpClient.patch<CardLocation>(`/cards/${cardId}/locations/${id}`, payload)
    return data
  },

  async remove(cardId: string, id: string): Promise<void> {
    await httpClient.delete(`/cards/${cardId}/locations/${id}`)
  },
}
