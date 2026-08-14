export interface MockDailyNote {
  id: string
  date: string
  text: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export const mockDailyNotes: MockDailyNote[] = [
  { id: 'note-1', date: '2026-08-06', text: 'Pagar el alquiler antes del día 10', active: true, createdAt: '2026-08-06T09:00:00.000Z', updatedAt: '2026-08-06T09:00:00.000Z' },
  { id: 'note-2', date: '2026-08-06', text: 'Comprar regalo de cumpleaños', active: true, createdAt: '2026-08-06T09:05:00.000Z', updatedAt: '2026-08-06T09:05:00.000Z' },
  { id: 'note-3', date: '2026-08-12', text: 'Vence la tarjeta de crédito', active: true, createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z' },
]
