// src/backend/firestore/cardLocations.ts
// Card locations backend using Firestore subcollection:
//   users/{uid}/cards/{cardId}/locations/{id}

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import { firebaseAuth, firestore } from './config'
import type {
  ICardLocationsBackend,
  CardLocation,
  CreateCardLocationPayload,
  UpdateCardLocationPayload,
} from '../types'

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid
  if (!uid) throw { message: 'No autenticado', statusCode: 401 }
  return uid
}

/** Firestore rechaza `undefined`; descartamos claves opcionales sin valor. */
function stripEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === '') continue
    out[key] = value
  }
  return out as T
}

export const firestoreCardLocationsBackend: ICardLocationsBackend = {
  async list(cardId: string): Promise<CardLocation[]> {
    const uid = requireUid()
    const q = query(
      collection(firestore, 'users', uid, 'cards', cardId, 'locations'),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs
      .filter((d) => d.data()['active'] !== false)
      .map((d) => ({ id: d.id, ...d.data() } as CardLocation))
  },

  async create(cardId: string, payload: CreateCardLocationPayload): Promise<CardLocation> {
    const uid = requireUid()
    const now = new Date().toISOString()
    const data = stripEmpty({ ...payload, cardId, active: true, createdAt: now, updatedAt: now })
    const ref = await addDoc(
      collection(firestore, 'users', uid, 'cards', cardId, 'locations'),
      data,
    )
    return { id: ref.id, ...data } as CardLocation
  },

  async update(cardId: string, id: string, payload: UpdateCardLocationPayload): Promise<CardLocation> {
    const uid = requireUid()
    const ref = doc(firestore, 'users', uid, 'cards', cardId, 'locations', id)
    await updateDoc(ref, stripEmpty({ ...payload, updatedAt: new Date().toISOString() }))
    const snap = await getDoc(ref)
    return { id: snap.id, ...snap.data() } as CardLocation
  },

  async remove(cardId: string, id: string): Promise<void> {
    const uid = requireUid()
    // Soft delete, coherente con el resto del modelo
    await updateDoc(doc(firestore, 'users', uid, 'cards', cardId, 'locations', id), {
      active: false,
      updatedAt: new Date().toISOString(),
    })
  },
}
