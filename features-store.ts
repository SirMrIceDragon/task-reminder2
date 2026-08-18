// Store برای ویژگی‌های جدید: یادداشت سریع، پیوست، مکان، تمرکز، آلارم هوشمند

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { QuickNote, Attachment, LocationReminder, FocusSession, SmartAlarm, NOTE_COLORS } from './new-features-types'

interface NewFeaturesStore {
  // یادداشت سریع
  notes: QuickNote[]
  addNote: (text: string, color?: string) => void
  updateNote: (id: string, updates: Partial<QuickNote>) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  
  // پیوست فایل
  attachments: Attachment[]
  addAttachment: (taskId: string, file: File) => Promise<void>
  deleteAttachment: (id: string) => void
  getTaskAttachments: (taskId: string) => Attachment[]
  
  // یادآور مکان
  locationReminders: LocationReminder[]
  addLocationReminder: (data: Omit<LocationReminder, 'id' | 'createdAt'>) => void
  deleteLocationReminder: (id: string) => void
  toggleLocationReminder: (id: string) => void
  
  // جلسه تمرکز
  focusSessions: FocusSession[]
  activeFocus: FocusSession | null
  startFocus: (durationMinutes: number, taskTitle?: string) => string
  stopFocus: (completed: boolean) => void
  
  // آلارم هوشمند
  smartAlarms: SmartAlarm[]
  addSmartAlarm: (data: Omit<SmartAlarm, 'id' | 'createdAt' | 'snoozeCount'>) => void
  updateSmartAlarm: (id: string, updates: Partial<SmartAlarm>) => void
  deleteSmartAlarm: (id: string) => void
  incrementSnooze: (id: string) => void
  resetSnooze: (id: string) => void
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function makeStorage() {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }
  return window.localStorage
}

export const useNewFeaturesStore = create<NewFeaturesStore>()(
  persist(
    (set, get) => ({
      // ============ یادداشت سریع ============
      notes: [],
      
      addNote: (text, color) => {
        const note: QuickNote = {
          id: generateId(),
          text,
          color: color || NOTE_COLORS[0],
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ notes: [note, ...state.notes] }))
      },
      
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }))
      },
      
      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
      },
      
      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        }))
      },
      
      // ============ پیوست فایل ============
      attachments: [],
      
      addAttachment: async (taskId, file) => {
        const base64 = await fileToBase64(file)
        const type: Attachment['type'] = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('audio/')
          ? 'audio'
          : 'file'
        
        const attachment: Attachment = {
          id: generateId(),
          taskId,
          type,
          name: file.name,
          data: base64,
          size: file.size,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ attachments: [...state.attachments, attachment] }))
      },
      
      deleteAttachment: (id) => {
        set((state) => ({ attachments: state.attachments.filter((a) => a.id !== id) }))
      },
      
      getTaskAttachments: (taskId) => {
        return get().attachments.filter((a) => a.taskId === taskId)
      },
      
      // ============ یادآور مکان ============
      locationReminders: [],
      
      addLocationReminder: (data) => {
        const reminder: LocationReminder = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ locationReminders: [...state.locationReminders, reminder] }))
      },
      
      deleteLocationReminder: (id) => {
        set((state) => ({ locationReminders: state.locationReminders.filter((r) => r.id !== id) }))
      },
      
      toggleLocationReminder: (id) => {
        set((state) => ({
          locationReminders: state.locationReminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        }))
      },
      
      // ============ جلسه تمرکز ============
      focusSessions: [],
      activeFocus: null,
      
      startFocus: (durationMinutes, taskTitle) => {
        const id = generateId()
        const now = new Date().toISOString()
        const session: FocusSession = {
          id,
          startedAt: now,
          durationSeconds: durationMinutes * 60,
          completed: false,
          taskTitle,
          createdAt: now,
        }
        set((state) => ({
          activeFocus: session,
          focusSessions: [session, ...state.focusSessions],
        }))
        return id
      },
      
      stopFocus: (completed) => {
        const active = get().activeFocus
        if (!active) return
        set((state) => ({
          focusSessions: state.focusSessions.map((s) =>
            s.id === active.id
              ? { ...s, endedAt: new Date().toISOString(), completed }
              : s
          ),
          activeFocus: null,
        }))
      },
      
      // ============ آلارم هوشمند ============
      smartAlarms: [],
      
      addSmartAlarm: (data) => {
        const alarm: SmartAlarm = {
          ...data,
          id: generateId(),
          snoozeCount: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ smartAlarms: [...state.smartAlarms, alarm] }))
      },
      
      updateSmartAlarm: (id, updates) => {
        set((state) => ({
          smartAlarms: state.smartAlarms.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },
      
      deleteSmartAlarm: (id) => {
        set((state) => ({ smartAlarms: state.smartAlarms.filter((a) => a.id !== id) }))
      },
      
      incrementSnooze: (id) => {
        set((state) => ({
          smartAlarms: state.smartAlarms.map((a) =>
            a.id === id ? { ...a, snoozeCount: a.snoozeCount + 1 } : a
          ),
        }))
      },
      
      resetSnooze: (id) => {
        set((state) => ({
          smartAlarms: state.smartAlarms.map((a) =>
            a.id === id ? { ...a, snoozeCount: 0 } : a
          ),
        }))
      },
    }),
    {
      name: 'task-manager-features-storage',
      storage: createJSONStorage(makeStorage),
      version: 1,
    }
  )
)
