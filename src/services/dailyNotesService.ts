// src/services/dailyNotesService.ts
// Thin delegator — all logic lives in the active backend implementation.

import { getDailyNotesBackend } from '@/backend'
import type { DailyNote, CreateDailyNotePayload, UpdateDailyNotePayload } from '@/backend/types'

export type { DailyNote, CreateDailyNotePayload, UpdateDailyNotePayload }

export const dailyNotesService = {
  async list(): Promise<DailyNote[]> {
    return (await getDailyNotesBackend()).list()
  },

  async create(payload: CreateDailyNotePayload): Promise<DailyNote> {
    return (await getDailyNotesBackend()).create(payload)
  },

  async update(id: string, payload: UpdateDailyNotePayload): Promise<DailyNote> {
    return (await getDailyNotesBackend()).update(id, payload)
  },

  async remove(id: string): Promise<void> {
    return (await getDailyNotesBackend()).remove(id)
  },
}
