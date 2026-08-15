'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Play, Pause, Square, Plus, Clock, Trash2,
  Bell, BellOff, CheckCircle2, AlarmClock, Brain, Coffee,
} from 'lucide-react'
import { createElement } from 'react'
import { useExtendedStore } from '@/lib/extended-store'
import { useTaskStore } from '@/lib/store'
import { getIconByName } from '@/lib/constants'
import { formatSeconds, formatDurationHuman } from '@/lib/time-format'
import { toPersianDigits, formatJalaliDate } from '@/lib/jalali'
import { toast } from 'sonner'
import { TimerSession } from '@/lib/social-types'
import { playNotificationSound, initAudio } from '@/lib/sounds'
import { AlarmPage } from './AlarmPage'
import { PomodoroPage } from './PomodoroPage'

const EMOJI_OPTIONS = ['📚', '💼', '🎯', '✏️', '💻', '🎨', '🎵', '⏰', '☕', '📝', '💡', '❤️', '⭐', '🔥', '✅', '🚀']

type TimerTab = 'stopwatch' | 'alarm' | 'pomodoro'

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return createElement(getIconByName(name), { className })
}

export function TimerPage() {
  const [activeTab, setActiveTab] = useState<TimerTab>('stopwatch')
  
  const tabs: { id: TimerTab; label: string; icon: typeof Clock }[] = [
    { id: 'stopwatch', label: 'کرونومتر', icon: Clock },
    { id: 'alarm', label: 'آلارم ساعت', icon: AlarmClock },
    { id: 'pomodoro', label: 'پومودورو', icon: Brain },
  ]
  
  return (
    <div className="px-4 py-4">
      {/* تب‌های تایمر */}
      <div className="flex gap-1.5 mb-4 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
                isActive ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      {/* محتوای تب */}
      {activeTab === 'stopwatch' && <StopwatchTab />}
      {activeTab === 'alarm' && <AlarmPage />}
      {activeTab === 'pomodoro' && <PomodoroPage />}
    </div>
  )
}

function StopwatchTab() {
  const {
    activeTimer, timerSessions,
    startTimer, pauseTimer, resumeTimer, stopTimer, deleteTimerSession,
  } = useExtendedStore()
  const { categories, getCategory } = useTaskStore()
  
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [now, setNow] = useState(Date.now())
  
  const getElapsedSeconds = useCallback((timer: TimerSession, currentTime: number): number => {
    if (timer.status === 'completed') return timer.elapsedSeconds
    if (timer.status === 'paused') return timer.elapsedSeconds
    const lastResume = timer.pauseHistory.length > 0
      ? new Date(timer.pauseHistory[timer.pauseHistory.length - 1].to).getTime()
      : new Date(timer.startedAt).getTime()
    const additional = Math.floor((currentTime - lastResume) / 1000)
    return timer.elapsedSeconds + additional
  }, [])
  
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [activeTimer?.id, activeTimer?.status])
  
  const lastNotifMin = useRef<number>(0)
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running' || !activeTimer.notificationEnabled) return
    const elapsed = getElapsedSeconds(activeTimer, now)
    const currentMin = Math.floor(elapsed / 60)
    if (currentMin > lastNotifMin.current && currentMin > 0) {
      lastNotifMin.current = currentMin
      playNotificationSound({ soundId: 'chime', type: 'default', volume: 30, vibrate: false })
    }
  }, [now, activeTimer, getElapsedSeconds])
  
  const handleStart = (data: {
    name: string; emoji: string; description: string; categoryId: string; notificationEnabled: boolean
  }) => {
    if (!data.name.trim()) {
      toast.error('نام تایمر را وارد کنید')
      return
    }
    initAudio()
    startTimer(data)
    lastNotifMin.current = 0
    setShowNewDialog(false)
    toast.success('تایمر شروع شد')
  }
  
  const handleStop = (id: string) => {
    if (confirm('تایمر متوقف و ذخیره شود؟')) {
      stopTimer(id)
      toast.success('تایمر ذخیره شد')
    }
  }
  
  const completedSessions = timerSessions.filter((t) => t.status === 'completed')
  const totalToday = completedSessions
    .filter((t) => {
      const d = new Date(t.startedAt)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    })
    .reduce((sum, t) => sum + t.elapsedSeconds, 0)
  
  return (
    <>
      {/* تایمر فعال */}
      {activeTimer && activeTimer.status !== 'completed' && (
        <ActiveTimerCard
          key={activeTimer.id}
          timer={activeTimer}
          elapsedSeconds={getElapsedSeconds(activeTimer, now)}
          onPause={() => pauseTimer(activeTimer.id)}
          onResume={() => { initAudio(); resumeTimer(activeTimer.id) }}
          onStop={() => handleStop(activeTimer.id)}
          category={getCategory(activeTimer.categoryId)}
        />
      )}
      
      {/* دکمه شروع تایمر جدید */}
      {(!activeTimer || activeTimer.status === 'completed') && (
        <Button
          onClick={() => setShowNewDialog(true)}
          className="w-full h-14 text-base"
          size="lg"
        >
          <Plus className="h-5 w-5 ml-2" />
          شروع کرونومتر جدید
        </Button>
      )}
      
      {/* آمار امروز */}
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">کل زمان امروز</p>
            <p className="text-2xl font-bold mt-1">{formatDurationHuman(totalToday)}</p>
          </div>
          <Clock className="h-8 w-8 text-primary opacity-50" />
        </div>
      </Card>
      
      {/* لیست جلسات */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
          جلسات اخیر ({toPersianDigits(completedSessions.length)})
        </h2>
        {completedSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            هنوز تایمری ثبت نشده
          </div>
        ) : (
          <div className="space-y-2">
            {completedSessions.map((session) => (
              <TimerSessionCard
                key={session.id}
                session={session}
                category={getCategory(session.categoryId)}
                onDelete={() => deleteTimerSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      <NewTimerDialog
        key={showNewDialog ? 'open' : 'closed'}
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        categories={categories}
        onStart={handleStart}
      />
    </>
  )
}

function ActiveTimerCard({
  timer, elapsedSeconds, onPause, onResume, onStop, category,
}: {
  timer: TimerSession
  elapsedSeconds: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
  category?: { name: string; color: string; icon: string }
}) {
  const isRunning = timer.status === 'running'
  
  return (
    <Card
      className="p-6 mb-4 border-2 border-primary/30 bg-primary/5"
      style={category ? { borderRightColor: category.color, borderRightWidth: '4px' } : {}}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{timer.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{timer.name}</h3>
          {category && (
            <Badge
              variant="secondary"
              className="text-xs mt-1 gap-1"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <CategoryIcon name={category.icon} className="h-3 w-3" />
              {category.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {timer.notificationEnabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {timer.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{timer.description}</p>
      )}
      
      <div className="text-center my-6">
        <div className="text-5xl font-mono font-bold tabular-nums tracking-tight">
          {formatSeconds(elapsedSeconds)}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
              isRunning ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-600'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-primary animate-pulse' : 'bg-amber-500'}`} />
            {isRunning ? 'در حال اجرا' : 'متوقف موقت'}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {isRunning ? (
          <Button onClick={onPause} variant="outline" className="flex-1 h-12">
            <Pause className="h-5 w-5 ml-2" />
            توقف موقت
          </Button>
        ) : (
          <Button onClick={onResume} className="flex-1 h-12">
            <Play className="h-5 w-5 ml-2" />
            ادامه
          </Button>
        )}
        <Button onClick={onStop} variant="destructive" className="flex-1 h-12">
          <Square className="h-5 w-5 ml-2" />
          پایان و ذخیره
        </Button>
      </div>
    </Card>
  )
}

function TimerSessionCard({
  session, category, onDelete,
}: {
  session: TimerSession
  category?: { name: string; color: string; icon: string }
  onDelete: () => void
}) {
  return (
    <Card
      className="p-3"
      style={category ? { borderRightWidth: '4px', borderRightColor: category.color } : {}}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{session.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{session.name}</h4>
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          {category && (
            <p className="text-xs text-muted-foreground mt-0.5">{category.name}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm font-mono font-semibold text-primary">
              {formatSeconds(session.elapsedSeconds)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatJalaliDate(new Date(session.startedAt), false)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {session.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{session.description}</p>
      )}
    </Card>
  )
}

function NewTimerDialog({
  open, onOpenChange, categories, onStart,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  categories: { id: string; name: string; color: string; icon: string }[]
  onStart: (data: { name: string; emoji: string; description: string; categoryId: string; notificationEnabled: boolean }) => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📚')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'study')
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle className="text-right">کرونومتر جدید</DialogTitle>
          <DialogDescription className="text-right">
            یک تایمر برای ردیابی کارت بساز
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>نام کار *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلا: درس خواندن فیزیک" />
          </div>
          
          <div className="space-y-2">
            <Label>ایموجی</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`aspect-square text-2xl rounded-md border-2 transition-all flex items-center justify-center ${
                    emoji === e ? 'border-primary bg-primary/10' : 'border-transparent bg-muted'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>دسته‌بندی</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      selected ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{
                      backgroundColor: selected ? `${cat.color}25` : 'var(--muted)',
                      color: selected ? cat.color : 'var(--muted-foreground)',
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="h-4 w-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>توضیحات (اختیاری)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات بیشتر..." rows={2} />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="timer-notif" className="flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4" />
              یادآوری هر دقیقه
            </Label>
            <Switch id="timer-notif" checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />
          </div>
          
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button className="flex-1" onClick={() => onStart({ name, emoji, description, categoryId, notificationEnabled })}>
              <Play className="h-4 w-4 ml-2" />
              شروع
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
