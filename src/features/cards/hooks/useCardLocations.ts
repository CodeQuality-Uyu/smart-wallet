// src/features/cards/hooks/useCardLocations.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardLocationsService } from '@/services/cardLocationsService'
import type { CreateCardLocationPayload, UpdateCardLocationPayload } from '@/types/models'

export const CARD_LOCATION_KEYS = {
  all: ['cardLocations'] as const,
  list: (cardId: string) => ['cardLocations', cardId] as const,
} as const

export function useCardLocations(cardId: string) {
  return useQuery({
    queryKey: CARD_LOCATION_KEYS.list(cardId),
    queryFn: () => cardLocationsService.list(cardId),
    enabled: Boolean(cardId),
  })
}

export function useCreateCardLocation(cardId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCardLocationPayload) => cardLocationsService.create(cardId, payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CARD_LOCATION_KEYS.list(cardId) }),
  })
}

export function useUpdateCardLocation(cardId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCardLocationPayload }) =>
      cardLocationsService.update(cardId, id, payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CARD_LOCATION_KEYS.list(cardId) }),
  })
}

export function useDeleteCardLocation(cardId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cardLocationsService.remove(cardId, id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: CARD_LOCATION_KEYS.list(cardId) }),
  })
}
