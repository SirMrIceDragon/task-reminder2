// انواع داده‌های تایمر، پروفایل و سوشال

// ============ تایمر ============
export interface TimerSession {
  id: string
  name: string
  emoji: string
  description: string
  categoryId: string
  
  // زمان‌سنجی
  startedAt: string // ISO
  endedAt?: string // ISO
  elapsedSeconds: number // مجموع ثانیه‌های کار کرده (excluding pauses)
  
  // وضعیت
  status: 'running' | 'paused' | 'completed'
  
  // pause/resume
  pausedAt?: string
  pauseHistory: { from: string; to: string }[]
  
  // نوتیف
  notificationEnabled: boolean
  
  createdAt: string
  updatedAt: string
}

// ============ پروفایل ============
export interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  job: string
  bio: string
  email: string // Gmail
  avatar: string // emoji or base64
  avatarType: 'emoji' | 'image'
  location: string
  gender: 'male' | 'female' | 'other' | ''
  createdAt: string
  updatedAt: string
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 0,
  weight: 0,
  height: 0,
  job: '',
  bio: '',
  email: '',
  avatar: '👤',
  avatarType: 'emoji',
  location: '',
  gender: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ============ سوشال ============
export interface Post {
  id: string
  authorId: string // 'me' for local user, demo IDs for others
  authorName: string
  authorAvatar: string
  authorAvatarType: 'emoji' | 'image'
  
  // محتوا
  text: string
  image?: string // base64
  wordCount: number
  
  // نوع پست
  type: 'general' | 'task_share' | 'timer_share'
  
  // اگر اشتراک‌گذاری تسک/تایمر است
  sharedTaskId?: string
  sharedTimerId?: string
  sharedTaskTitle?: string // برای وقتی تسک پاک شده
  sharedTimerName?: string
  sharedTimerSeconds?: number
  originalDeleted?: boolean
  
  // تعامل
  likes: string[] // آرایه‌ای از userId ها
  comments: Comment[]
  shares: number
  savedBy: string[]
  
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  text: string
  createdAt: string
}

// ============ آلارم ساعت ============
export interface Alarm {
  id: string
  time: string // "HH:MM"
  label: string
  emoji: string
  enabled: boolean
  
  // روزهای هفته (0=یکشنبه, 6=شنبه)
  repeatDays: number[] // خالی = یک‌بار
  
  // صدا
  soundType: 'default' | 'custom'
  soundId?: string // برای default
  customSoundName?: string // برای custom
  customSoundData?: string // base64 audio
  volume: number
  vibrate: boolean
  
  // snooze
  snoozeEnabled: boolean
  snoozeMinutes: number
  
  createdAt: string
  updatedAt: string
}

// ============ پومودورو ============
export interface PomodoroSession {
  id: string
  workMinutes: number
  breakMinutes: number
  
  // وضعیت
  status: 'work' | 'break' | 'paused' | 'stopped'
  currentPhase: 'work' | 'break'
  cycleCount: number // تعداد چرخه‌های کامل
  
  // زمان
  startedAt: string
  endedAt?: string
  remainingSeconds: number // زمان باقی‌مانده در فاز فعلی
  phaseStartedAt?: string // شروع فاز فعلی
  
  // صدا/نوتیف
  soundEnabled: boolean
  soundId: string
  volume: number
  vibrate: boolean
  
  // اشتراک‌گذاری
  shared: boolean
  
  createdAt: string
  updatedAt: string
}

// محدودیت کلمات
export const MAX_POST_WORDS = 200
export const MAX_COMMENT_WORDS = 50

// پست‌های نمونه برای دمو
export const DEMO_POSTS: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    authorId: 'demo1',
    authorName: 'سارا محمدی',
    authorAvatar: '👩',
    authorAvatarType: 'emoji',
    text: 'امروز ۳ ساعت درس خوندم! احساس خوبی دارم 📚✨ موفقیت در گرو تلاش مداومشه',
    wordCount: 14,
    type: 'general',
    likes: ['demo2', 'demo3'],
    comments: [
      {
        id: 'c1',
        authorId: 'demo2',
        authorName: 'علی رضایی',
        authorAvatar: '👨',
        text: 'آفرین! ادامه بده 💪',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    shares: 2,
    savedBy: [],
  },
  {
    authorId: 'demo2',
    authorName: 'علی رضایی',
    authorAvatar: '🧑',
    authorAvatarType: 'emoji',
    text: 'یک ساعت ورزش کردم صبح! تایمر گذاشتم و نتونستم کمتر کار کنم 😅 روز خوبی داشته باشین همه',
    wordCount: 18,
    type: 'timer_share',
    sharedTimerName: 'ورزش صبحگاهی',
    sharedTimerSeconds: 3600,
    likes: ['demo1'],
    comments: [],
    shares: 0,
    savedBy: ['demo1'],
  },
  {
    authorId: 'demo3',
    authorName: 'مریم حسینی',
    authorAvatar: '👧',
    authorAvatarType: 'emoji',
    text: 'تسک "پروژه نهایی" رو کامل کردم! 🎉 سه هفته کار کردم بالاخره تموم شد',
    wordCount: 15,
    type: 'task_share',
    sharedTaskTitle: 'پروژه نهایی',
    likes: ['demo1', 'demo2'],
    comments: [
      {
        id: 'c2',
        authorId: 'demo1',
        authorName: 'سارا محمدی',
        authorAvatar: '👩',
        text: 'تبریک میگم! 🎊',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'c3',
        authorId: 'demo2',
        authorName: 'علی رضایی',
        authorAvatar: '🧑',
        text: 'عالی بود',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    shares: 1,
    savedBy: [],
  },
]
