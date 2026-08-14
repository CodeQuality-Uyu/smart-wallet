// src/backend/msw/dailyNotes.ts
// Daily notes backend implemented via the MSW-intercepted HTTP adapter

import { httpClient } from '@/api/httpClient'
import type { IDailyNotesBackend, DailyNote, CreateDailyNotePayload, UpdateDailyNotePayload } from '../types'

export const mswDailyNotesBackend: IDailyNotesBackend = {
  async list(): Promise<DailyNote[]> {
    const { data } = await httpClient.get<DailyNote[]>('/daily-notes')
    return data
  },

  async create(payload: CreateDailyNotePayload): Promise<DailyNote> {
    const { data } = await httpClient.post<DailyNote>('/daily-notes', payload)
    return data
  },

  async update(id: string, payload: UpdateDailyNotePayload): Promise<DailyNote> {
    const { data } = await httpClient.patch<DailyNote>(`/daily-notes/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/daily-notes/${id}`)
  },
}
