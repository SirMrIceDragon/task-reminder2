// انواع داده‌های اپلیکیشن مدیریت تسک

export type NotificationType = 'default' | 'alarm' | 'call' | 'silent'

export type Priority = 'low' | 'medium' | 'high'

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'

export interface Task {
  id: string
  title: string
  description?: string
  categoryId: string
  
  // زمان تسک
  dueDate: string // ISO datetime
  hasTime: boolean // آیا زمان دقیق (ساعت/دقیقه/ثانیه) تنظیم شده یا فقط تاریخ
  
  // وضعیت
  completed: boolean
  completedAt?: string
  active: boolean // اگر false باشد تسک غیرفعال است (بعد از تکمیل یا دستی)
  
  // شخصی‌سازی نوتیفیکیشن
  notificationText: string // متن دلخواه نوتیف
  notificationType: NotificationType
  notificationSound: string // شناسه صدا
  notificationVolume: number // 0 تا 100
  notificationVibrate: boolean
  
  // تکرار روزانه
  recurringEnabled: boolean // اگر true و تسک تیک نخورده، هر روز سر آن زمان نوتیف بده
  repeatType: RepeatType
  repeatIntervalDays: number // برای تکرار سفارشی
  
  // اضافی
  priority: Priority
  color?: string
  tags: string[]
  
  // snooze
  snoozedUntil?: string
  
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string // hex color
  icon: string // نام آیکن lucide
  createdAt: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  colorTheme: string // ID تم رنگی
  defaultNotificationType: NotificationType
  defaultSound: string
  defaultVolume: number
  defaultVibrate: boolean
  language: 'fa' | 'en'
  useJalaliCalendar: boolean
  notificationsEnabled: boolean
  autoCompleteOnDue: boolean
  sortTasksBy: 'dueDate' | 'priority' | 'createdAt' | 'title'
  sortDirection: 'asc' | 'desc'
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  colorTheme: 'emerald',
  defaultNotificationType: 'default',
  defaultSound: 'chime',
  defaultVolume: 70,
  defaultVibrate: true,
  language: 'fa',
  useJalaliCalendar: true,
  notificationsEnabled: true,
  autoCompleteOnDue: false,
  sortTasksBy: 'dueDate',
  sortDirection: 'asc',
}

export const DEFAULT_CATEGORIES: Omit<Category, 'createdAt'>[] = [
  { id: 'study', name: 'درسی', color: '#10b981', icon: 'BookOpen' },
  { id: 'work', name: 'کاری', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'personal', name: 'شخصی', color: '#a855f7', icon: 'User' },
  { id: 'health', name: 'سلامتی', color: '#ef4444', icon: 'Heart' },
  { id: 'shopping', name: 'خرید', color: '#f59e0b', icon: 'ShoppingCart' },
  { id: 'other', name: 'سایر', color: '#6b7280', icon: 'Folder' },
]

export const NOTIFICATION_SOUNDS = [
  { id: 'chime', name: 'نوای آرام' },
  { id: 'bell', name: 'زنگ کلاسیک' },
  { id: 'marimba', name: 'ماریبا' },
  { id: 'digital', name: 'دیجیتال' },
  { id: 'cosmic', name: 'کیهانی' },
  { id: 'urgent', name: 'فوری' },
] as const

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  default: 'پیش‌فرض',
  alarm: 'مثل آلارم (تکرار شونده)',
  call: 'مثل کال موبایل (زنگ طولانی)',
  silent: 'بدون صدا',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
}

export const REPEAT_LABELS: Record<RepeatType, string> = {
  none: 'بدون تکرار',
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  custom: 'سفارشی',
}
