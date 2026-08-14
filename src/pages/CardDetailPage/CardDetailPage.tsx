// src/pages/CardDetailPage/CardDetailPage.tsx
// Detalle de una tarjeta: dónde está registrada (plataformas/servicios).

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCards } from '@/features/cards/hooks/useCards'
import {
  useCardLocations,
  useCreateCardLocation,
  useUpdateCardLocation,
  useDeleteCardLocation,
} from '@/features/cards/hooks/useCardLocations'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { Currency, RecurringFrequency, CardType } from '@/types/enums'
import type { CardLocation } from '@/types/models'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './CardDetailPage.module.css'

const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  [RecurringFrequency.Monthly]: 'Mensual',
  [RecurringFrequency.Bimonthly]: 'Bimestral',
  [RecurringFrequency.Quarterly]: 'Trimestral',
  [RecurringFrequency.Biannual]: 'Semestral',
  [RecurringFrequency.Annual]: 'Anual',
}

const FREQUENCY_OPTIONS = Object.values(RecurringFrequency)

function cardGradient(color?: string): string {
  return color ?? 'linear-gradient(135deg,#0c1f1a,#0d3528)'
}

interface LocationForm {
  name: string
  amount: string
  currency: Currency
  frequency: RecurringFrequency | ''
  url: string
  notes: string
}

const EMPTY_FORM: LocationForm = {
  name: '',
  amount: '',
  currency: Currency.UYU,
  frequency: '',
  url: '',
  notes: '',
}

export default function CardDetailPage(): React.ReactElement {
  const { id = '' } = useParams<{ id: string }>()
  const { data: cards, isLoading: cardsLoading } = useCards()
  const { data: locations, isLoading, isError } = useCardLocations(id)
  const createLocation = useCreateCardLocation(id)
  const updateLocation = useUpdateCardLocation(id)
  const deleteLocation = useDeleteCardLocation(id)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<LocationForm>(EMPTY_FORM)

  const card = cards?.find((c) => c.id === id)

  function openCreate(): void {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(loc: CardLocation): void {
    setEditingId(loc.id)
    setForm({
      name: loc.name,
      amount: loc.amount != null ? String(loc.amount) : '',
      currency: loc.currency ?? Currency.UYU,
      frequency: loc.frequency ?? '',
      url: loc.url ?? '',
      notes: loc.notes ?? '',
    })
    setShowForm(true)
  }

  function closeForm(): void {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function change(field: keyof LocationForm, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const amountNum = form.amount.trim() !== '' ? Number(form.amount) : undefined
    const payload = {
      name,
      amount: amountNum,
      currency: amountNum != null ? form.currency : undefined,
      frequency: form.frequency !== '' ? form.frequency : undefined,
      url: form.url.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }
    if (editingId) {
      await updateLocation.mutateAsync({ id: editingId, payload })
    } else {
      await createLocation.mutateAsync(payload)
    }
    closeForm()
  }

  async function handleDelete(locId: string): Promise<void> {
    await deleteLocation.mutateAsync(locId)
  }

  if (cardsLoading) return <LoadingSpinner fullPage />

  const isSaving = createLocation.isPending || updateLocation.isPending

  return (
    <div className={styles.page}>
      <PageHeader title={card ? card.name : 'Tarjeta'} showBack />

      {card && (
        <div className={styles.cardVisual} style={{ background: cardGradient(card.color) }}>
          <div className={styles.cardVisualTop}>
            <span className={styles.cardVisualBadge}>
              {card.type === CardType.Credit ? 'Crédito' : 'Débito'}
            </span>
            <span className={styles.cardVisualBank}>{card.bank}</span>
          </div>
          <p className={styles.cardVisualNumber}>
            {card.lastFour ? `•••• •••• •••• ${card.lastFour}` : '•••• •••• •••• ——'}
          </p>
        </div>
      )}

      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Dónde está registrada</h2>
          <p className={styles.sectionSub}>
            Plataformas y servicios donde tenés cargada esta tarjeta
          </p>
        </div>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={openCreate}>
            ＋ Agregar
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Plataforma / servicio</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => change('name', e.target.value)}
              placeholder="Ej: Netflix, Spotify, MercadoLibre"
              autoFocus
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Monto (opcional)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => change('amount', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Moneda</label>
              <div className={styles.toggle}>
                {[Currency.UYU, Currency.USD].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={[styles.toggleBtn, form.currency === c ? styles.toggleBtnActive : ''].join(' ')}
                    onClick={() => change('currency', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Frecuencia (opcional)</label>
            <div className={styles.freqRow}>
              <button
                type="button"
                className={[styles.freqBtn, form.frequency === '' ? styles.freqBtnActive : ''].join(' ')}
                onClick={() => change('frequency', '')}
              >
                Ninguna
              </button>
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={[styles.freqBtn, form.frequency === f ? styles.freqBtnActive : ''].join(' ')}
                  onClick={() => change('frequency', f)}
                >
                  {FREQUENCY_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Link (opcional)</label>
            <input
              className={styles.input}
              type="url"
              value={form.url}
              onChange={(e) => change('url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notas (opcional)</label>
            <textarea
              className={styles.textarea}
              value={form.notes}
              onChange={(e) => change('notes', e.target.value)}
              rows={2}
              placeholder="Ej: plan familiar, renueva el día 5…"
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" size="sm" loading={isSaving} disabled={!form.name.trim()}>
              {editingId ? 'Guardar cambios' : 'Agregar ubicación'}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message="No se pudieron cargar las ubicaciones" />}

      {!isLoading && !isError && (
        <div className={styles.list}>
          {(locations ?? []).length === 0 && !showForm && (
            <p className={styles.empty}>
              Todavía no registraste dónde está puesta esta tarjeta. Agregá la primera ubicación.
            </p>
          )}
          {(locations ?? []).map((loc) => (
            <div key={loc.id} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemNameRow}>
                  <span className={styles.itemName}>{loc.name}</span>
                  {loc.frequency && (
                    <span className={styles.itemBadge}>{FREQUENCY_LABEL[loc.frequency]}</span>
                  )}
                </div>
                {loc.amount != null && loc.currency && (
                  <span className={styles.itemAmount}>{formatCurrency(loc.amount, loc.currency)}</span>
                )}
                {loc.notes && <span className={styles.itemNotes}>{loc.notes}</span>}
                {loc.url && (
                  <a className={styles.itemLink} href={loc.url} target="_blank" rel="noopener noreferrer">
                    🔗 Abrir plataforma
                  </a>
                )}
              </div>
              <div className={styles.itemActions}>
                <button className={styles.iconBtn} type="button" title="Editar" onClick={() => openEdit(loc)}>
                  ✏️
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.iconDelete}`}
                  type="button"
                  title="Eliminar"
                  onClick={() => handleDelete(loc.id)}
                  disabled={deleteLocation.isPending}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
