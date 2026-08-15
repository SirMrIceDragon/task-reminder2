// تم‌های رنگی متنوع برای اپلیکیشن

export interface AppTheme {
  id: string
  name: string
  emoji: string
  // رنگ‌های اصلی
  primary: string
  primaryDark: string
  primaryLight: string
  // رنگ‌های پس‌زمینه
  background: string
  card: string
  // ring
  ring: string
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'emerald',
    name: 'سبز زمردی',
    emoji: '🌿',
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    background: '#f0fdf4',
    card: '#ffffff',
    ring: '#10b981',
  },
  {
    id: 'ocean',
    name: 'آبی اقیانوس',
    emoji: '🌊',
    primary: '#0ea5e9',
    primaryDark: '#0284c7',
    primaryLight: '#38bdf8',
    background: '#f0f9ff',
    card: '#ffffff',
    ring: '#0ea5e9',
  },
  {
    id: 'sunset',
    name: 'نارنجی غروب',
    emoji: '🌅',
    primary: '#f97316',
    primaryDark: '#ea580c',
    primaryLight: '#fb923c',
    background: '#fff7ed',
    card: '#ffffff',
    ring: '#f97316',
  },
  {
    id: 'purple',
    name: 'بنفش سلطنتی',
    emoji: '👑',
    primary: '#a855f7',
    primaryDark: '#9333ea',
    primaryLight: '#c084fc',
    background: '#faf5ff',
    card: '#ffffff',
    ring: '#a855f7',
  },
  {
    id: 'rose',
    name: 'صورتی رز',
    emoji: '🌸',
    primary: '#ec4899',
    primaryDark: '#db2777',
    primaryLight: '#f472b6',
    background: '#fdf2f8',
    card: '#ffffff',
    ring: '#ec4899',
  },
  {
    id: 'crimson',
    name: 'قرمز یاقوتی',
    emoji: '💎',
    primary: '#ef4444',
    primaryDark: '#dc2626',
    primaryLight: '#f87171',
    background: '#fef2f2',
    card: '#ffffff',
    ring: '#ef4444',
  },
  {
    id: 'teal',
    name: 'فیروزه‌ای دریا',
    emoji: '🦩',
    primary: '#14b8a6',
    primaryDark: '#0d9488',
    primaryLight: '#2dd4bf',
    background: '#f0fdfa',
    card: '#ffffff',
    ring: '#14b8a6',
  },
  {
    id: 'indigo',
    name: 'نیلی شب',
    emoji: '🌌',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    background: '#eef2ff',
    card: '#ffffff',
    ring: '#6366f1',
  },
  {
    id: 'amber',
    name: 'زرد کهربایی',
    emoji: '🍯',
    primary: '#f59e0b',
    primaryDark: '#d97706',
    primaryLight: '#fbbf24',
    background: '#fffbeb',
    card: '#ffffff',
    ring: '#f59e0b',
  },
  {
    id: 'lime',
    name: 'سبز لیمویی',
    emoji: '🥑',
    primary: '#84cc16',
    primaryDark: '#65a30d',
    primaryLight: '#a3e635',
    background: '#f7fee7',
    card: '#ffffff',
    ring: '#84cc16',
  },
  {
    id: 'midnight',
    name: 'مشکی شب',
    emoji: '🌑',
    primary: '#64748b',
    primaryDark: '#475569',
    primaryLight: '#94a3b8',
    background: '#f8fafc',
    card: '#ffffff',
    ring: '#64748b',
  },
  {
    id: 'dragon',
    name: 'آتش اژدها',
    emoji: '🐉',
    primary: '#dc2626',
    primaryDark: '#991b1b',
    primaryLight: '#ef4444',
    background: '#fef2f2',
    card: '#ffffff',
    ring: '#dc2626',
  },
]

export const DEFAULT_THEME_ID = 'emerald'

export function getThemeById(id: string): AppTheme {
  return APP_THEMES.find((t) => t.id === id) || APP_THEMES[0]
}
