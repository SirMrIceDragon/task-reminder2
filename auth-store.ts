// سیستم احراز هویت با localStorage
// قابل ارتقا به Supabase در آینده

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, RegisterData, LoginData, Gender } from './auth-types'

interface AuthStore {
  currentUser: User | null
  isAuthenticated: boolean
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  getUserByUsername: (username: string) => User | null
  searchUsers: (query: string) => User[]
}

interface UserRecord extends User {
  passwordHash: string
}

function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `hash_${hash}_${password.length}`
}

function generateId(): string {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

function makeStorage() {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }
  return window.localStorage
}

function getUsersDB(): UserRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('task-reminder-users-db')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveUsersDB(users: UserRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('task-reminder-users-db', JSON.stringify(users))
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      
      register: async (data: RegisterData) => {
        // اعتبارسنجی نام کاربری (فقط انگلیسی، عدد، _
        if (!data.username.trim() || data.username.length < 3) {
          return { success: false, error: 'ID باید حداقل ۳ کاراکتر باشد' }
        }
        if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
          return { success: false, error: 'ID فقط باید شامل حروف انگلیسی، عدد و _ باشد' }
        }
        if (!data.displayName.trim()) {
          return { success: false, error: 'نام را وارد کنید' }
        }
        if (!data.gender) {
          return { success: false, error: 'جنسیت را انتخاب کنید' }
        }
        if (!data.password || data.password.length < 6) {
          return { success: false, error: 'رمز باید حداقل ۶ کاراکتر باشد' }
        }
        
        const users = getUsersDB()
        if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) {
          return { success: false, error: 'این ID قبلاً استفاده شده' }
        }
        
        const newUser: UserRecord = {
          id: generateId(),
          username: data.username.trim(),
          displayName: data.displayName.trim(),
          gender: data.gender,
          avatar: data.avatar || (data.gender === 'female' ? '👩' : data.gender === 'male' ? '👨' : '👤'),
          avatarType: 'emoji',
          bio: '',
          createdAt: new Date().toISOString(),
          followersCount: 0,
          followingCount: 0,
          passwordHash: hashPassword(data.password),
        }
        
        users.push(newUser)
        saveUsersDB(users)
        
        const { passwordHash, ...userWithoutPassword } = newUser
        set({ currentUser: userWithoutPassword, isAuthenticated: true })
        
        return { success: true }
      },
      
      login: async (data: LoginData) => {
        const users = getUsersDB()
        const user = users.find(u => u.username.toLowerCase() === data.username.toLowerCase())
        
        if (!user) {
          return { success: false, error: 'کاربری با این ID وجود ندارد' }
        }
        
        if (user.passwordHash !== hashPassword(data.password)) {
          return { success: false, error: 'رمز اشتباه است' }
        }
        
        const { passwordHash, ...userWithoutPassword } = user
        set({ currentUser: userWithoutPassword, isAuthenticated: true })
        
        return { success: true }
      },
      
      logout: () => {
        set({ currentUser: null, isAuthenticated: false })
      },
      
      updateProfile: (updates) => {
        set((state) => {
          if (!state.currentUser) return state
          const updatedUser = { ...state.currentUser, ...updates }
          const users = getUsersDB()
          const idx = users.findIndex(u => u.id === state.currentUser?.id)
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...updates }
            saveUsersDB(users)
          }
          return { currentUser: updatedUser }
        })
      },
      
      getUserByUsername: (username) => {
        const users = getUsersDB()
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())
        if (!user) return null
        const { passwordHash, ...userWithoutPassword } = user
        return userWithoutPassword
      },
      
      searchUsers: (query) => {
        if (!query.trim()) return []
        const users = getUsersDB()
        const q = query.toLowerCase()
        return users
          .filter(u => 
            u.username.toLowerCase().includes(q) || 
            u.displayName.toLowerCase().includes(q)
          )
          .slice(0, 20)
          .map(({ passwordHash, ...u }) => u)
      },
    }),
    {
      name: 'task-reminder-auth',
      storage: createJSONStorage(makeStorage),
      version: 1,
    }
  )
)
