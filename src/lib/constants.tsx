// ثابت‌های اپلیکیشن - آیکن‌های دسته‌بندی و رنگ‌ها

import {
  BookOpen, Briefcase, User, Heart, ShoppingCart, Folder,
  Dumbbell, Plane, Gift, Coffee, Pencil, Code, Music,
  Camera, Wallet, Baby, PawPrint, Car, Home, GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Briefcase,
  User,
  Heart,
  ShoppingCart,
  Folder,
  Dumbbell,
  Plane,
  Gift,
  Coffee,
  Pencil,
  Code,
  Music,
  Camera,
  Wallet,
  Baby,
  PawPrint,
  Car,
  Home,
  GraduationCap,
}

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS)

export const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue (مجاز چون انتخاب کاربر است)
  '#a855f7', // purple
  '#ef4444', // red
  '#f59e0b', // amber
  '#6b7280', // gray
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#eab308', // yellow
  '#6366f1', // indigo (پیش‌فرض کاربر)
]

export const TASK_COLORS = [
  '#10b981',
  '#3b82f6',
  '#a855f7',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

// گرفتن آیکن بر اساس نام
export function getIconByName(name: string): LucideIcon {
  return CATEGORY_ICONS[name] || Folder
}
