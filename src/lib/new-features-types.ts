// انواع داده‌های ویژگی‌های جدید

// یادداشت سریع
export interface QuickNote {
  id: string
  text: string
  color: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

// پیوست فایل به تسک
export interface Attachment {
  id: string
  taskId: string
  type: 'image' | 'file' | 'audio'
  name: string
  data: string // base64
  size: number
  createdAt: string
}

// یادآور مکان‌محور
export interface LocationReminder {
  id: string
  taskId: string
  lat: number
  lng: number
  radius: number // متر
  address: string
  trigger: 'arrive' | 'leave'
  enabled: boolean
  createdAt: string
}

// جلسه تمرکز
export interface FocusSession {
  id: string
  startedAt: string
  endedAt?: string
  durationSeconds: number
  completed: boolean
  taskTitle?: string
  createdAt: string
}

// آلارم صبحگاهی هوشمند
export interface SmartAlarm {
  id: string
  time: string // "HH:MM"
  enabled: boolean
  // تنظیمات صدا
  gradualVolume: boolean // صدای نرم شروع شود
  maxVolume: number
  soundId: string
  // معما
  puzzleEnabled: boolean
  puzzleType: 'math' | 'memory' | 'tap'
  // پیام انگیزشی
  motivationalMessage: boolean
  // snooze
  snoozeLimit: number // حداکثر تعداد snooze
  snoozeCount: number
  createdAt: string
}

// رنگ‌های تم
export const THEME_COLORS = [
  { id: 'emerald', name: 'سبز', primary: '#10b981', primaryDark: '#059669' },
  { id: 'blue', name: 'آبی', primary: '#3b82f6', primaryDark: '#2563eb' },
  { id: 'purple', name: 'بنفش', primary: '#a855f7', primaryDark: '#9333ea' },
  { id: 'orange', name: 'نارنجی', primary: '#f97316', primaryDark: '#ea580c' },
  { id: 'pink', name: 'صورتی', primary: '#ec4899', primaryDark: '#db2777' },
  { id: 'red', name: 'قرمز', primary: '#ef4444', primaryDark: '#dc2626' },
  { id: 'teal', name: 'فیروزه‌ای', primary: '#14b8a6', primaryDark: '#0d9488' },
  { id: 'indigo', name: 'نیلی', primary: '#6366f1', primaryDark: '#4f46e5' },
] as const

// رنگ‌های یادداشت سریع
export const NOTE_COLORS = [
  '#fef3c7', // زرد کم‌رنگ
  '#fce7f3', // صورتی کم‌رنگ
  '#dbeafe', // آبی کم‌رنگ
  '#d1fae5', // سبز کم‌رنگ
  '#fef9c3', // لیمویی
  '#e0e7ff', // بنفش کم‌رنگ
  '#fed7aa', // نارنجی کم‌رنگ
  '#f3f4f6', // خاکستری
]
