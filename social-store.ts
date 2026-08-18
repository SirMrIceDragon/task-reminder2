// Store سوشال - آپدیت شده برای پست‌های کاربران مختلف

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SocialPost, SocialComment, MAX_POST_WORDS } from './auth-types'
import { useAuthStore } from './auth-store'

interface SocialStore {
  posts: SocialPost[]
  savedPosts: string[]
  
  createPost: (data: { text: string; image?: string; type?: SocialPost['type']; sharedTaskTitle?: string; sharedTimerName?: string; sharedTimerSeconds?: number }) => boolean
  deletePost: (id: string) => void
  likePost: (id: string) => void
  commentOnPost: (id: string, text: string) => boolean
  sharePost: (id: string) => void
  savePost: (id: string) => void
  getUserPosts: (userId: string) => SocialPost[]
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function makeStorage() {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }
  return window.localStorage
}

// پست‌های نمونه برای نمایش
const DEMO_POSTS: SocialPost[] = [
  {
    id: 'demo1',
    userId: 'demo_user_1',
    username: 'sara_math',
    displayName: 'سارا محمدی',
    avatar: '👩',
    text: 'امروز ۳ ساعت درس خوندم! احساس خوبی دارم 📚✨ موفقیت در گرو تلاش مداومشه',
    wordCount: 14,
    type: 'general',
    likes: ['demo_user_2', 'demo_user_3'],
    comments: [
      {
        id: 'c1',
        userId: 'demo_user_2',
        username: 'ali_study',
        displayName: 'علی رضایی',
        avatar: '👨',
        text: 'آفرین! ادامه بده 💪',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    shares: 2,
    savedBy: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'demo2',
    userId: 'demo_user_2',
    username: 'ali_study',
    displayName: 'علی رضایی',
    avatar: '🧑',
    text: 'یک ساعت ورزش کردم صبح! تایمر گذاشتم و نتونستم کمتر کار کنم 😅 روز خوبی داشته باشین همه',
    wordCount: 18,
    type: 'timer_share',
    sharedTimerName: 'ورزش صبحگاهی',
    sharedTimerSeconds: 3600,
    likes: ['demo_user_1'],
    comments: [],
    shares: 0,
    savedBy: ['demo_user_1'],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'demo3',
    userId: 'demo_user_3',
    username: 'maryam_k',
    displayName: 'مریم حسینی',
    avatar: '👧',
    text: 'تسک "پروژه نهایی" رو کامل کردم! 🎉 سه هفته کار کردم بالاخره تموم شد',
    wordCount: 15,
    type: 'task_share',
    sharedTaskTitle: 'پروژه نهایی',
    likes: ['demo_user_1', 'demo_user_2'],
    comments: [
      {
        id: 'c2',
        userId: 'demo_user_1',
        username: 'sara_math',
        displayName: 'سارا محمدی',
        avatar: '👩',
        text: 'تبریک میگم! 🎊',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    shares: 1,
    savedBy: [],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 21600000).toISOString(),
  },
]

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      posts: DEMO_POSTS,
      savedPosts: [],
      
      createPost: (data) => {
        const auth = useAuthStore.getState()
        if (!auth.isAuthenticated || !auth.currentUser) {
          return false
        }
        
        const wordCount = countWords(data.text)
        if (wordCount > MAX_POST_WORDS) {
          return false
        }
        
        const now = new Date().toISOString()
        const post: SocialPost = {
          id: generateId(),
          userId: auth.currentUser.id,
          username: auth.currentUser.username,
          displayName: auth.currentUser.displayName,
          avatar: auth.currentUser.avatar,
          text: data.text.trim(),
          image: data.image,
          wordCount,
          type: data.type || 'general',
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
        
        set((state) => ({ posts: [post, ...state.posts] }))
        return true
      },
      
      deletePost: (id) => {
        const auth = useAuthStore.getState()
        if (!auth.currentUser) return
        
        set((state) => ({
          posts: state.posts.filter((p) => !(p.id === id && p.userId === auth.currentUser?.id)),
          savedPosts: state.savedPosts.filter((sid) => sid !== id),
        }))
      },
      
      likePost: (id) => {
        const auth = useAuthStore.getState()
        if (!auth.currentUser) return
        
        const userId = auth.currentUser.id
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === id) {
              const liked = p.likes.includes(userId)
              return {
                ...p,
                likes: liked ? p.likes.filter((l) => l !== userId) : [...p.likes, userId],
              }
            }
            return p
          }),
        }))
      },
      
      commentOnPost: (id, text) => {
        const auth = useAuthStore.getState()
        if (!auth.currentUser || !text.trim()) return false
        
        const comment: SocialComment = {
          id: generateId(),
          userId: auth.currentUser.id,
          username: auth.currentUser.username,
          displayName: auth.currentUser.displayName,
          avatar: auth.currentUser.avatar,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, comments: [...p.comments, comment] } : p
          ),
        }))
        return true
      },
      
      sharePost: (id) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, shares: p.shares + 1 } : p
          ),
        }))
      },
      
      savePost: (id) => {
        const auth = useAuthStore.getState()
        if (!auth.currentUser) return
        
        set((state) => {
          const isSaved = state.savedPosts.includes(id)
          return {
            savedPosts: isSaved
              ? state.savedPosts.filter((sid) => sid !== id)
              : [...state.savedPosts, id],
          }
        })
      },
      
      getUserPosts: (userId) => {
        return get().posts.filter((p) => p.userId === userId)
      },
    }),
    {
      name: 'task-reminder-social-storage',
      storage: createJSONStorage(makeStorage),
      version: 1,
    }
  )
)
