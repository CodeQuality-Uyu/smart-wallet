// src/backend/firestore/dailyNotes.ts
// Daily notes backend using Firestore collection: users/{uid}/dailyNotes

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import { firebaseAuth, firestore } from './config'
import type { IDailyNotesBackend, DailyNote, CreateDailyNotePayload, UpdateDailyNotePayload } from '../types'

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid
  if (!uid) throw { message: 'No autenticado', statusCode: 401 }
  return uid
}

export const firestoreDailyNotesBackend: IDailyNotesBackend = {
  async list(): Promise<DailyNote[]> {
    const uid = requireUid()
    const q = query(
      collection(firestore, 'users', uid, 'dailyNotes'),
      orderBy('date', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs
      .filter((d) => d.data()['active'] === true)
      .map((d) => ({ id: d.id, ...d.data() } as DailyNote))
  },

  async create(payload: CreateDailyNotePayload): Promise<DailyNote> {
    const uid = requireUid()
    const now = new Date().toISOString()
    const data = { ...payload, active: true, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(firestore, 'users', uid, 'dailyNotes'), data)
    return { id: ref.id, ...data }
  },

  async update(id: string, payload: UpdateDailyNotePayload): Promise<DailyNote> {
    const uid = requireUid()
    const ref = doc(firestore, 'users', uid, 'dailyNotes', id)
    await updateDoc(ref, { ...payload, updatedAt: new Date().toISOString() })
    const snap = await getDoc(ref)
    return { id: snap.id, ...snap.data() } as DailyNote
  },

  async remove(id: string): Promise<void> {
    const uid = requireUid()
    // Soft delete: nunca borramos documentos (datos reales en producción)
    await updateDoc(doc(firestore, 'users', uid, 'dailyNotes', id), {
      active: false,
      updatedAt: new Date().toISOString(),
    })
  },
}
