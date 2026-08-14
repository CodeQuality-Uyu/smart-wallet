import type { CardLocation } from '@/types/models'
import { Currency, RecurringFrequency } from '@/types/enums'

export const mockCardLocations: CardLocation[] = [
  { id: 'loc-1', cardId: 'card-2', name: 'Netflix', amount: 15.99, currency: Currency.USD, frequency: RecurringFrequency.Monthly, url: 'https://netflix.com/account', notes: 'Plan estándar', active: true, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'loc-2', cardId: 'card-2', name: 'Spotify', amount: 299, currency: Currency.UYU, frequency: RecurringFrequency.Monthly, active: true, createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z' },
  { id: 'loc-3', cardId: 'card-4', name: 'MercadoLibre', notes: 'Guardada para compras', active: true, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
]
