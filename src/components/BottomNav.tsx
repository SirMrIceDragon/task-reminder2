'use client'

import { useState } from 'react'
import { ListChecks, Clock, Users, User, BookOpen, StickyNote, MoreHorizontal, Brain, MapPin, Sunrise } from 'lucide-react'
import { toPersianDigits } from '@/lib/jalali'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

export type PageType = 'tasks' | 'timer' | 'notes' | 'social' | 'more' | 'resources' | 'profile' | 'focus' | 'location' | 'smartAlarm'

interface BottomNavProps {
  active: PageType
  onChange: (page: PageType) => void
  timerActive?: boolean
  taskOverdueCount?: number
  notesCount?: number
}

export function BottomNav({ active, onChange, timerActive, taskOverdueCount, notesCount }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false)
  
  const mainItems: { id: PageType; label: string; icon: typeof ListChecks; badge?: number | boolean }[] = [
    {
      id: 'tasks',
      label: 'تسک‌ها',
      icon: ListChecks,
      badge: taskOverdueCount && taskOverdueCount > 0 ? taskOverdueCount : undefined,
    },
    {
      id: 'timer',
      label: 'تایمر',
      icon: Clock,
      badge: timerActive,
    },
    {
      id: 'notes',
      label: 'یادداشت',
      icon: StickyNote,
      badge: notesCount && notesCount > 0 ? notesCount : undefined,
    },
    {
      id: 'social',
      label: 'سوشال',
      icon: Users,
    },
    {
      id: 'more',
      label: 'بیشتر',
      icon: MoreHorizontal,
    },
  ]
  
  const moreItems: { id: PageType; label: string; icon: typeof ListChecks; desc: string }[] = [
    { id: 'resources', label: 'منابع درسی', icon: BookOpen, desc: 'سایت‌های آموزشی' },
    { id: 'focus', label: 'حالت تمرکز', icon: Brain, desc: 'تمرکز کامل' },
    { id: 'location', label: 'یادآور مکان', icon: MapPin, desc: 'یادآوری بر اساس مکان' },
    { id: 'smartAlarm', label: 'بیدار شو!', icon: Sunrise, desc: 'آلارم هوشمند صبحگاهی' },
    { id: 'profile', label: 'پروفایل', icon: User, desc: 'اطلاعات کاربری' },
  ]
  
  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t safe-bottom"
        style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}
      >
        <div
          className="flex items-center justify-around px-2 py-2"
          style={{ maxWidth: '480px', margin: '0 auto' }}
        >
          {mainItems.map((item) => {
            const isActive = active === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'more') {
                    setShowMore(true)
                  } else {
                    onChange(item.id)
                  }
                }}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-lg flex-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                style={{ maxWidth: '110px', minHeight: '48px' }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1.5 -left-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        typeof item.badge === 'number'
                          ? 'bg-destructive text-white'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {typeof item.badge === 'number' ? toPersianDigits(item.badge) : ''}
                      {typeof item.badge === 'boolean' && item.badge && (
                        <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
      
      <Dialog open={showMore} onOpenChange={setShowMore}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">بیشتر</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {moreItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChange(item.id)
                    setShowMore(false)
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 hover:bg-accent transition-colors"
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
