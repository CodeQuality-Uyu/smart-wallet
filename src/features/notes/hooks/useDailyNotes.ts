// src/features/notes/hooks/useDailyNotes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dailyNotesService } from '@/services/dailyNotesService'
import type { CreateDailyNotePayload, UpdateDailyNotePayload } from '@/types/models'

export const DAILY_NOTES_KEY = ['dailyNotes'] as const

export function useDailyNotes() {
  return useQuery({
    queryKey: DAILY_NOTES_KEY,
    queryFn: () => dailyNotesService.list(),
  })
}

export function useCreateDailyNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDailyNotePayload) => dailyNotesService.create(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: DAILY_NOTES_KEY }),
  })
}

export function useUpdateDailyNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDailyNotePayload }) =>
      dailyNotesService.update(id, payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: DAILY_NOTES_KEY }),
  })
}

export function useDeleteDailyNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dailyNotesService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: DAILY_NOTES_KEY }),
  })
}
