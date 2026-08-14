// src/services/cardLocationsService.ts
// Thin delegator — all logic lives in the active backend implementation.

import { getCardLocationsBackend } from '@/backend'
import type { CardLocation, CreateCardLocationPayload, UpdateCardLocationPayload } from '@/backend/types'

export type { CardLocation, CreateCardLocationPayload, UpdateCardLocationPayload }

export const cardLocationsService = {
  async list(cardId: string): Promise<CardLocation[]> {
    return (await getCardLocationsBackend()).list(cardId)
  },

  async create(cardId: string, payload: CreateCardLocationPayload): Promise<CardLocation> {
    return (await getCardLocationsBackend()).create(cardId, payload)
  },

  async update(cardId: string, id: string, payload: UpdateCardLocationPayload): Promise<CardLocation> {
    return (await getCardLocationsBackend()).update(cardId, id, payload)
  },

  async remove(cardId: string, id: string): Promise<void> {
    return (await getCardLocationsBackend()).remove(cardId, id)
  },
}
