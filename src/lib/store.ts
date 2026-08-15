// Store اصلی اپلیکیشن با Zustand و localStorage persistence

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Task, Category, AppSettings, DEFAULT_SETTINGS, DEFAULT_CATEGORIES } from './types'

interface TaskStore {
  tasks: Task[]
  categories: Category[]
  settings: AppSettings
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  toggleActive: (id: string) => void
  snoozeTask: (id: string, minutes: number) => void
  
  // Category actions
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => Category
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
  
  // Helpers
  getTask: (id: string) => Task | undefined
  getCategory: (id: string) => Category | undefined
  getTasksByCategory: (categoryId: string) => Task[]
  getActiveTasks: () => Task[]
  getCompletedTasks: () => Task[]
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function seedCategories(): Category[] {
  const now = new Date().toISOString()
  return DEFAULT_CATEGORIES.map((c) => ({ ...c, createdAt: now }))
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: seedCategories(),
      settings: { ...DEFAULT_SETTINGS },

      addTask: (taskData) => {
        const now = new Date().toISOString()
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ tasks: [newTask, ...state.tasks] }))
        return newTask
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: true, completedAt: new Date().toISOString(), active: false, updatedAt: new Date().toISOString() }
              : t
          ),
        }))
      },

      uncompleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: false, completedAt: undefined, active: true, updatedAt: new Date().toISOString() }
              : t
          ),
        }))
      },

      toggleActive: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, active: !t.active, updatedAt: new Date().toISOString() }
              : t
          ),
        }))
      },

      snoozeTask: (id, minutes) => {
        const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString()
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, snoozedUntil, updatedAt: new Date().toISOString() } : t
          ),
        }))
      },

      addCategory: (catData) => {
        const newCat: Category = {
          ...catData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ categories: [...state.categories, newCat] }))
        return newCat
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          // تسک‌های این دسته به "سایر" منتقل می‌شوند یا در همان دسته می‌مانند ولی نمایش داده نمی‌شوند
          tasks: state.tasks.map((t) =>
            t.categoryId === id ? { ...t, categoryId: 'other' } : t
          ),
        }))
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
      },

      resetSettings: () => {
        set({ settings: { ...DEFAULT_SETTINGS } })
      },

      getTask: (id) => get().tasks.find((t) => t.id === id),
      getCategory: (id) => get().categories.find((c) => c.id === id),
      getTasksByCategory: (categoryId) => get().tasks.filter((t) => t.categoryId === categoryId),
      getActiveTasks: () => get().tasks.filter((t) => t.active && !t.completed),
      getCompletedTasks: () => get().tasks.filter((t) => t.completed),
    }),
    {
      name: 'task-manager-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // SSR-safe fallback
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return window.localStorage
      }),
      version: 1,
    }
  )
)
