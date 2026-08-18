// Store برای تایمر، پروفایل و سوشال

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimerSession, UserProfile, DEFAULT_PROFILE, Post, Comment, DEMO_POSTS, MAX_POST_WORDS, Alarm, PomodoroSession } from './social-types'

interface ExtendedStore {
  // تایمر
  timerSessions: TimerSession[]
  activeTimer: TimerSession | null
  
  startTimer: (data: { name: string; emoji: string; description: string; categoryId: string; notificationEnabled: boolean }) => string
  pauseTimer: (id: string) => void
  resumeTimer: (id: string) => void
  stopTimer: (id: string) => void
  deleteTimerSession: (id: string) => void
  getTimerSessions: () => TimerSession[]
  
  // پروفایل
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  resetProfile: () => void
  
  // سوشال
  posts: Post[]
  savedPosts: string[] // IDs of saved posts
  
  createPost: (data: { text: string; image?: string; type?: Post['type']; sharedTaskId?: string; sharedTimerId?: string; sharedTaskTitle?: string; sharedTimerName?: string; sharedTimerSeconds?: number }) => void
  deletePost: (id: string) => void
  likePost: (id: string) => void
  commentOnPost: (id: string, text: string) => void
  sharePost: (id: string) => void
  savePost: (id: string) => void
  // وقتی تسک/تایمر پاک می‌شود
  markSharedItemDeleted: (type: 'task' | 'timer', itemId: string) => void
  
  // آلارم ساعت
  alarms: Alarm[]
  addAlarm: (data: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAlarm: (id: string, updates: Partial<Alarm>) => void
  deleteAlarm: (id: string) => void
  toggleAlarm: (id: string) => void
  
  // پومودورو
  pomodoroSessions: PomodoroSession[]
  activePomodoro: PomodoroSession | null
  startPomodoro: (data: { workMinutes: number; breakMinutes: number; soundEnabled: boolean; soundId: string; volume: number; vibrate: boolean }) => string
  updatePomodoro: (id: string, updates: Partial<PomodoroSession>) => void
  pausePomodoro: (id: string) => void
  resumePomodoro: (id: string) => void
  stopPomodoro: (id: string) => void
  deletePomodoroSession: (id: string) => void
  sharePomodoroToSocial: (id: string, text: string) => void
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function makeStorage() {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
  return window.localStorage
}

export const useExtendedStore = create<ExtendedStore>()(
  persist(
    (set, get) => ({
      // ============ تایمر ============
      timerSessions: [],
      activeTimer: null,
      
      startTimer: (data) => {
        const id = generateId()
        const now = new Date().toISOString()
        const session: TimerSession = {
          id,
          name: data.name,
          emoji: data.emoji,
          description: data.description,
          categoryId: data.categoryId,
          startedAt: now,
          elapsedSeconds: 0,
          status: 'running',
          pauseHistory: [],
          notificationEnabled: data.notificationEnabled,
          createdAt: now,
          updatedAt: now,
        }
        set({ activeTimer: session, timerSessions: [session, ...get().timerSessions] })
        return id
      },
      
      pauseTimer: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const updated = state.timerSessions.map((t) => {
            if (t.id === id && t.status === 'running') {
              // محاسبه ثانیه‌های کار کرده تا حالا
              const sessionStart = t.pausedAt ? new Date(t.pausedAt).getTime() : new Date(t.startedAt).getTime()
              // در واقع وقتی running است، آخرین شروع یا resume از کجا بوده؟
              // ما elapsedSeconds را وقتی pause/resume می‌کنیم آپدیت می‌کنیم
              // وقتی running است، آخرین "resume from" یا startedAt ملاک است
              const lastResume = t.pauseHistory.length > 0 
                ? new Date(t.pauseHistory[t.pauseHistory.length - 1].to).getTime()
                : new Date(t.startedAt).getTime()
              const additionalSeconds = Math.floor((Date.now() - lastResume) / 1000)
              return {
                ...t,
                status: 'paused' as const,
                pausedAt: now,
                elapsedSeconds: t.elapsedSeconds + additionalSeconds,
                updatedAt: now,
              }
            }
            return t
          })
          const active = updated.find((t) => t.id === id) || null
          return { timerSessions: updated, activeTimer: active }
        })
      },
      
      resumeTimer: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const updated = state.timerSessions.map((t) => {
            if (t.id === id && t.status === 'paused' && t.pausedAt) {
              const newPauseEntry = { from: t.pausedAt, to: now }
              return {
                ...t,
                status: 'running' as const,
                pausedAt: undefined,
                pauseHistory: [...t.pauseHistory, newPauseEntry],
                updatedAt: now,
              }
            }
            return t
          })
          const active = updated.find((t) => t.id === id) || null
          return { timerSessions: updated, activeTimer: active }
        })
      },
      
      stopTimer: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const updated = state.timerSessions.map((t) => {
            if (t.id === id && t.status !== 'completed') {
              let finalElapsed = t.elapsedSeconds
              if (t.status === 'running') {
                const lastResume = t.pauseHistory.length > 0
                  ? new Date(t.pauseHistory[t.pauseHistory.length - 1].to).getTime()
                  : new Date(t.startedAt).getTime()
                finalElapsed += Math.floor((Date.now() - lastResume) / 1000)
              }
              return {
                ...t,
                status: 'completed' as const,
                endedAt: now,
                elapsedSeconds: finalElapsed,
                pausedAt: undefined,
                updatedAt: now,
              }
            }
            return t
          })
          return { timerSessions: updated, activeTimer: null }
        })
      },
      
      deleteTimerSession: (id) => {
        set((state) => ({
          timerSessions: state.timerSessions.filter((t) => t.id !== id),
          activeTimer: state.activeTimer?.id === id ? null : state.activeTimer,
        }))
        // علامت‌گذاری پست‌های مرتبط به عنوان "پاک شده"
        get().markSharedItemDeleted('timer', id)
      },
      
      getTimerSessions: () => get().timerSessions,
      
      // ============ پروفایل ============
      profile: { ...DEFAULT_PROFILE },
      
      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates, updatedAt: new Date().toISOString() },
        }))
      },
      
      resetProfile: () => {
        set({ profile: { ...DEFAULT_PROFILE, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } })
      },
      
      // ============ سوشال ============
      posts: (() => {
        const now = Date.now()
        return DEMO_POSTS.map((p, i) => ({
          ...p,
          id: `demo-${i}`,
          createdAt: new Date(now - (i + 1) * 3600000 * 3).toISOString(),
          updatedAt: new Date(now - (i + 1) * 3600000 * 3).toISOString(),
        }))
      })(),
      savedPosts: [],
      
      createPost: (data) => {
        const state = get()
        const wordCount = countWords(data.text)
        if (wordCount > MAX_POST_WORDS) {
          return
        }
        const now = new Date().toISOString()
        const post: Post = {
          id: generateId(),
          authorId: 'me',
          authorName: state.profile.name || 'من',
          authorAvatar: state.profile.avatar,
          authorAvatarType: state.profile.avatarType,
          text: data.text,
          image: data.image,
          wordCount,
          type: data.type || 'general',
          sharedTaskId: data.sharedTaskId,
          sharedTimerId: data.sharedTimerId,
          sharedTaskTitle: data.sharedTaskTitle,
          sharedTimerName: data.sharedTimerName,
          sharedTimerSeconds: data.sharedTimerSeconds,
          originalDeleted: false,
          likes: [],
          comments: [],
          shares: 0,
          savedBy: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ posts: [post, ...s.posts] }))
      },
      
      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
          savedPosts: state.savedPosts.filter((sid) => sid !== id),
        }))
      },
      
      likePost: (id) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === id) {
              const liked = p.likes.includes('me')
              return {
                ...p,
                likes: liked ? p.likes.filter((l) => l !== 'me') : [...p.likes, 'me'],
              }
            }
            return p
          }),
        }))
      },
      
      commentOnPost: (id, text) => {
        const state = get()
        const wordCount = countWords(text)
        if (wordCount > 50 || !text.trim()) return
        const comment: Comment = {
          id: generateId(),
          authorId: 'me',
          authorName: state.profile.name || 'من',
          authorAvatar: state.profile.avatar,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, comments: [...p.comments, comment] } : p
          ),
        }))
      },
      
      sharePost: (id) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, shares: p.shares + 1 } : p
          ),
        }))
      },
      
      savePost: (id) => {
        set((state) => {
          const isSaved = state.savedPosts.includes(id)
          return {
            savedPosts: isSaved
              ? state.savedPosts.filter((sid) => sid !== id)
              : [...state.savedPosts, id],
          }
        })
      },
      
      markSharedItemDeleted: (type, itemId) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (type === 'task' && p.sharedTaskId === itemId) {
              return { ...p, originalDeleted: true }
            }
            if (type === 'timer' && p.sharedTimerId === itemId) {
              return { ...p, originalDeleted: true }
            }
            return p
          }),
        }))
      },
      
      // ============ آلارم ساعت ============
      alarms: [],
      
      addAlarm: (data) => {
        const id = generateId()
        const now = new Date().toISOString()
        const alarm: Alarm = { ...data, id, createdAt: now, updatedAt: now }
        set((state) => ({ alarms: [...state.alarms, alarm] }))
      },
      
      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }))
      },
      
      deleteAlarm: (id) => {
        set((state) => ({ alarms: state.alarms.filter((a) => a.id !== id) }))
      },
      
      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled, updatedAt: new Date().toISOString() } : a
          ),
        }))
      },
      
      // ============ پومودورو ============
      pomodoroSessions: [],
      activePomodoro: null,
      
      startPomodoro: (data) => {
        const id = generateId()
        const now = new Date().toISOString()
        const session: PomodoroSession = {
          id,
          workMinutes: data.workMinutes,
          breakMinutes: data.breakMinutes,
          status: 'work',
          currentPhase: 'work',
          cycleCount: 0,
          startedAt: now,
          remainingSeconds: data.workMinutes * 60,
          phaseStartedAt: now,
          soundEnabled: data.soundEnabled,
          soundId: data.soundId,
          volume: data.volume,
          vibrate: data.vibrate,
          shared: false,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          activePomodoro: session,
          pomodoroSessions: [session, ...state.pomodoroSessions],
        }))
        return id
      },
      
      updatePomodoro: (id, updates) => {
        set((state) => {
          const updated = state.pomodoroSessions.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
          const active = updated.find((p) => p.id === id && p.status !== 'stopped') || null
          return { pomodoroSessions: updated, activePomodoro: active }
        })
      },
      
      pausePomodoro: (id) => {
        get().updatePomodoro(id, { status: 'paused' })
      },
      
      resumePomodoro: (id) => {
        const session = get().pomodoroSessions.find((p) => p.id === id)
        if (!session) return
        get().updatePomodoro(id, {
          status: session.currentPhase,
          phaseStartedAt: new Date().toISOString(),
        })
      },
      
      stopPomodoro: (id) => {
        get().updatePomodoro(id, {
          status: 'stopped',
          endedAt: new Date().toISOString(),
        })
        set({ activePomodoro: null })
      },
      
      deletePomodoroSession: (id) => {
        set((state) => ({
          pomodoroSessions: state.pomodoroSessions.filter((p) => p.id !== id),
          activePomodoro: state.activePomodoro?.id === id ? null : state.activePomodoro,
        }))
      },
      
      sharePomodoroToSocial: (id, text) => {
        const session = get().pomodoroSessions.find((p) => p.id === id)
        if (!session) return
        
        const totalSeconds = session.cycleCount * (session.workMinutes + session.breakMinutes) * 60
        const now = new Date().toISOString()
        const post: Post = {
          id: generateId(),
          authorId: 'me',
          authorName: get().profile.name || 'من',
          authorAvatar: get().profile.avatar,
          authorAvatarType: get().profile.avatarType,
          text: text || `🍅 ${session.cycleCount} چرخه پومودورو کامل کردم! (${session.workMinutes} دقیقه کار / ${session.breakMinutes} دقیقه استراحت)`,
          wordCount: countWords(text || ''),
          type: 'timer_share',
          sharedTimerId: id,
          sharedTimerName: `پومودورو ${session.workMinutes}/${session.breakMinutes}`,
          sharedTimerSeconds: totalSeconds,
          originalDeleted: false,
          likes: [],
          comments: [],
          shares: 0,
          savedBy: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({
          posts: [post, ...s.posts],
          pomodoroSessions: s.pomodoroSessions.map((p) =>
            p.id === id ? { ...p, shared: true } : p
          ),
        }))
      },
    }),
    {
      name: 'task-manager-extended-storage',
      storage: createJSONStorage(makeStorage),
      version: 1,
    }
  )
)
