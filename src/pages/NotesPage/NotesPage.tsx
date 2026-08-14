// src/pages/NotesPage/NotesPage.tsx
// Calendario de notas por día: click a un día para ver/agregar notas.

import React, { useMemo, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import {
  useDailyNotes,
  useCreateDailyNote,
  useUpdateDailyNote,
  useDeleteDailyNote,
} from '@/features/notes/hooks/useDailyNotes'
import type { DailyNote } from '@/types/models'
import styles from './NotesPage.module.css'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Formatea un año/mes/día como 'YYYY-MM-DD' sin depender de la zona horaria. */
function toISODate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/** Índice de columna (0 = lunes … 6 = domingo) para el primer día del mes. */
function firstWeekdayIndex(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay() // 0 = domingo
  return (jsDay + 6) % 7
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]} de ${y}`
}

export default function NotesPage(): React.ReactElement {
  const { data: notes, isLoading, isError } = useDailyNotes()
  const createNote = useCreateDailyNote()
  const updateNote = useUpdateDailyNote()
  const deleteNote = useDeleteDailyNote()

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Draft para agregar / editar dentro del panel del día seleccionado
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate())

  // Agrupar notas por fecha para pintar puntos en el calendario
  const notesByDate = useMemo(() => {
    const map = new Map<string, DailyNote[]>()
    for (const note of notes ?? []) {
      const list = map.get(note.date)
      if (list) list.push(note)
      else map.set(note.date, [note])
    }
    return map
  }, [notes])

  const selectedNotes = selectedDate ? notesByDate.get(selectedDate) ?? [] : []

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const leadingBlanks = firstWeekdayIndex(viewYear, viewMonth)

  function goToPrevMonth(): void {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNextMonth(): void {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function goToday(): void {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  function openDay(iso: string): void {
    setSelectedDate(iso)
    setDraft('')
    setEditingId(null)
  }

  function closePanel(): void {
    setSelectedDate(null)
    setDraft('')
    setEditingId(null)
  }

  async function handleAdd(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !selectedDate) return
    await createNote.mutateAsync({ date: selectedDate, text })
    setDraft('')
  }

  function startEdit(note: DailyNote): void {
    setEditingId(note.id)
    setEditingText(note.text)
  }

  async function saveEdit(): Promise<void> {
    const text = editingText.trim()
    if (!editingId || !text) return
    await updateNote.mutateAsync({ id: editingId, payload: { text } })
    setEditingId(null)
    setEditingText('')
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteNote.mutateAsync(id)
  }

  const monthNav = (
    <div className={styles.monthNav}>
      <button className={styles.navBtn} onClick={goToPrevMonth} aria-label="Mes anterior">‹</button>
      <button className={styles.todayBtn} onClick={goToday} type="button">Hoy</button>
      <button className={styles.navBtn} onClick={goToNextMonth} aria-label="Mes siguiente">›</button>
    </div>
  )

  return (
    <div className={styles.page}>
      <PageHeader
        title="Notas"
        subtitle="Tocá un día para agregar recordatorios y notas"
        rightAction={monthNav}
      />

      {isLoading && <LoadingSpinner fullPage />}
      {isError && <ErrorMessage message="No se pudieron cargar las notas" />}

      {!isLoading && !isError && (
        <>
          <div className={styles.monthLabel}>
            {MONTHS[viewMonth]} {viewYear}
          </div>

          <div className={styles.calendar}>
            {WEEKDAYS.map((wd) => (
              <div key={wd} className={styles.weekday}>{wd}</div>
            ))}

            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} className={styles.blank} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const iso = toISODate(viewYear, viewMonth, day)
              const dayNotes = notesByDate.get(iso) ?? []
              const isToday = iso === todayISO
              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    styles.dayCell,
                    isToday ? styles.dayToday : '',
                    dayNotes.length ? styles.dayHasNotes : '',
                  ].join(' ')}
                  onClick={() => openDay(iso)}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  {dayNotes.length > 0 && (
                    <span className={styles.dayBadge}>{dayNotes.length}</span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Panel del día seleccionado */}
      {selectedDate && (
        <div className={styles.overlay} onClick={closePanel}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{formatLongDate(selectedDate)}</h2>
              <button className={styles.panelClose} type="button" onClick={closePanel}>✕</button>
            </div>

            <div className={styles.notesList}>
              {selectedNotes.length === 0 && (
                <p className={styles.empty}>No hay notas para este día todavía.</p>
              )}
              {selectedNotes.map((note) => (
                <div key={note.id} className={styles.noteItem}>
                  {editingId === note.id ? (
                    <div className={styles.editRow}>
                      <textarea
                        className={styles.textarea}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div className={styles.editActions}>
                        <button className={styles.cancelBtn} type="button" onClick={() => setEditingId(null)}>
                          Cancelar
                        </button>
                        <button
                          className={styles.saveBtn}
                          type="button"
                          onClick={saveEdit}
                          disabled={updateNote.isPending || !editingText.trim()}
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={styles.noteText}>{note.text}</span>
                      <div className={styles.noteActions}>
                        <button className={styles.iconBtn} type="button" title="Editar" onClick={() => startEdit(note)}>
                          ✏️
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconDelete}`}
                          type="button"
                          title="Eliminar"
                          onClick={() => handleDelete(note.id)}
                          disabled={deleteNote.isPending}
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <form className={styles.addForm} onSubmit={handleAdd}>
              <textarea
                className={styles.textarea}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribí una nota para este día…"
                rows={2}
              />
              <button
                className={styles.addBtn}
                type="submit"
                disabled={createNote.isPending || !draft.trim()}
              >
                ＋ Agregar nota
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
