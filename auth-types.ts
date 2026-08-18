// انواع داده‌های کاربر و احراز هویت

export type Gender = 'male' | 'female' | 'other'

export interface User {
  id: string
  username: string  // ID انگلیسی منحصر به فرد
  displayName: string
  gender: Gender
  email?: string
  avatar: string
  avatarType: 'emoji' | 'image'
  bio: string
  createdAt: string
  followersCount: number
  followingCount: number
}

export interface AuthSession {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface RegisterData {
  username: string  // انگلیسی، منحصر به فرد
  displayName: string
  gender: Gender
  password: string
  avatar?: string
}

export interface LoginData {
  username: string
  password: string
}

// پست سوشال
export interface SocialPost {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string
  text: string
  image?: string
  wordCount: number
  type: 'general' | 'task_share' | 'timer_share'
  sharedTaskTitle?: string
  sharedTimerName?: string
  sharedTimerSeconds?: number
  originalDeleted?: boolean
  likes: string[]
  comments: SocialComment[]
  shares: number
  savedBy: string[]
  createdAt: string
  updatedAt: string
}

export interface SocialComment {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string
  text: string
  createdAt: string
}

// چت
export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderUsername: string
  senderDisplayName: string
  senderAvatar: string
  text: string
  createdAt: string
  read: boolean
}

export interface Chat {
  id: string
  type: 'private' | 'group'
  name?: string  // برای گروه
  avatar?: string  // برای گروه
  participants: string[]  // userId ها
  participantsInfo: {
    userId: string
    username: string
    displayName: string
    avatar: string
  }[]
  lastMessage?: ChatMessage
  createdAt: string
  updatedAt: string
}

// چرخه پریود
export interface PeriodCycle {
  id: string
  userId: string
  startDate: string  // ISO
  cycleLength: number  // معمولا 28 روز
  periodLength: number  // معمولا 5 روز
  symptoms: string[]
  notes: string
  createdAt: string
}

export const MAX_POST_WORDS = 200
export const MAX_COMMENT_WORDS = 50
export const MAX_GROUP_MEMBERS = 30
