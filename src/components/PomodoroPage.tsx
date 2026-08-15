'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Play, Pause, Square, Clock, Coffee, Brain, RotateCw,
  Music, Volume2, Vibrate, Share2, Trash2, CheckCircle2, Bell,
} from 'lucide-react'
import { useExtendedStore } from '@/lib/extended-store'
import { PomodoroSession } from '@/lib/social-types'
import { NOTIFICATION_SOUNDS } from '@/lib/types'
import { playNotificationSound, testSound } from '@/lib/sounds'
import { formatSeconds } from '@/lib/time-format'
import { toPersianDigits, formatJalaliDate } from '@/lib/jalali'
import { toast } from 'sonner'

export function PomodoroPage() {
  const {
    activePomodoro, pomodoroSessions,
    startPomodoro, updatePomodoro, pausePomodoro, resumePomodoro, stopPomodoro,
    deletePomodoroSession, sharePomodoroToSocial,
  } = useExtendedStore()
  
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [shareDialogFor, setShareDialogFor] = useState<PomodoroSession | null>(null)
  
  // آپدیت هر ثانیه
  useEffect(() => {
    if (!activePomodoro || (activePomodoro.status !== 'work' && activePomodoro.status !== 'break')) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [activePomodoro?.id, activePomodoro?.status])
  
  // وقتی فاز تمام می‌شود
  const handlePhaseEnd = useCallback((session: PomodoroSession) => {
    const wasWork = session.currentPhase === 'work'
    
    // نوتیف
    if (session.soundEnabled) {
      playNotificationSound({
        soundId: session.soundId,
        type: 'alarm',
        volume: session.volume,
        vibrate: session.vibrate,
      })
    }
    
    if (wasWork) {
      // کار تمام شد → استراحت شروع شود
      updatePomodoro(session.id, {
        currentPhase: 'break',
        status: 'break',
        cycleCount: session.cycleCount + 1,
        remainingSeconds: session.breakMinutes * 60,
        phaseStartedAt: new Date().toISOString(),
      })
      toast.success(`✅ چرخه ${toPersianDigits(session.cycleCount + 1)} کامل شد! وقت استراحت 🌿`)
    } else {
      // استراحت تمام شد → کار شروع شود
      updatePomodoro(session.id, {
        currentPhase: 'work',
        status: 'work',
        remainingSeconds: session.workMinutes * 60,
        phaseStartedAt: new Date().toISOString(),
      })
      toast.info('⏰ استراحت تمام شد! وقت کار 💪')
    }
  }, [updatePomodoro])
  
  // محاسبه زمان باقی‌مانده
  const getRemainingSeconds = useCallback((session: PomodoroSession, currentTime: number): number => {
    if (session.status === 'paused' || session.status === 'stopped') {
      return session.remainingSeconds
    }
    if (!session.phaseStartedAt) return session.remainingSeconds
    
    const elapsed = Math.floor((currentTime - new Date(session.phaseStartedAt).getTime()) / 1000)
    const remaining = session.remainingSeconds - elapsed
    
    // اگر زمان تمام شد
    if (remaining <= 0 && (session.status === 'work' || session.status === 'break')) {
      handlePhaseEnd(session)
      return 0
    }
    
    return Math.max(0, remaining)
  }, [handlePhaseEnd])
  
  const handleStart = (data: {
    workMinutes: number
    breakMinutes: number
    soundEnabled: boolean
    soundId: string
    volume: number
    vibrate: boolean
  }) => {
    startPomodoro(data)
    setShowNewDialog(false)
    toast.success('پومودورو شروع شد 🍅')
  }
  
  const handlePause = (id: string) => {
    const session = pomodoroSessions.find((p) => p.id === id)
    if (!session || session.status === 'stopped') return
    // ذخیره زمان باقی‌مانده
    const remaining = getRemainingSeconds(session, now)
    updatePomodoro(id, {
      remainingSeconds: remaining,
      status: 'paused',
      phaseStartedAt: undefined,
    })
  }
  
  const handleResume = (id: string) => {
    resumePomodoro(id)
  }
  
  const handleStop = (id: string) => {
    if (confirm('پومودورو متوقف شود؟')) {
      stopPomodoro(id)
      toast.success('پومودورو متوقف شد')
    }
  }
  
  const completedSessions = pomodoroSessions.filter((p) => p.status === 'stopped')
  const totalCyclesToday = completedSessions
    .filter((p) => {
      const d = new Date(p.startedAt)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    })
    .reduce((sum, p) => sum + p.cycleCount, 0)
  
  return (
    <div className="px-4 py-4">
      {/* پومودورو فعال */}
      {activePomodoro && activePomodoro.status !== 'stopped' && (
        <ActivePomodoroCard
          key={activePomodoro.id}
          session={activePomodoro}
          remainingSeconds={getRemainingSeconds(activePomodoro, now)}
          onPause={() => handlePause(activePomodoro.id)}
          onResume={() => handleResume(activePomodoro.id)}
          onStop={() => handleStop(activePomodoro.id)}
        />
      )}
      
      {/* دکمه شروع جدید */}
      {(!activePomodoro || activePomodoro.status === 'stopped') && (
        <Button
          onClick={() => setShowNewDialog(true)}
          className="w-full h-14 text-base"
          size="lg"
        >
          <Brain className="h-5 w-5 ml-2" />
          شروع پومودورو جدید
        </Button>
      )}
      
      {/* آمار امروز */}
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">چرخه‌های امروز</p>
            <p className="text-2xl font-bold mt-1">{toPersianDigits(totalCyclesToday)} 🍅</p>
          </div>
          <RotateCw className="h-8 w-8 text-primary opacity-50" />
        </div>
      </Card>
      
      {/* راهنما */}
      <Card className="p-4 mt-4 bg-muted/50">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          پومودورو چیست؟
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          تکنیک پومودورو: ۲۵ دقیقه کار متمرکز، سپس ۵ دقیقه استراحت. این چرخه تکرار می‌شود تا خودت متوقف کنی. هر چرخه = یک 🍅
        </p>
      </Card>
      
      {/* جلسات قبلی */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
          جلسات قبلی ({toPersianDigits(completedSessions.length)})
        </h2>
        {completedSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            هنوز پومودورویی ثبت نشده
          </div>
        ) : (
          <div className="space-y-2">
            {completedSessions.map((session) => (
              <PomodoroSessionCard
                key={session.id}
                session={session}
                onDelete={() => deletePomodoroSession(session.id)}
                onShare={() => setShareDialogFor(session)}
              />
            ))}
          </div>
        )}
      </div>
      
      <NewPomodoroDialog
        key={showNewDialog ? 'open' : 'closed'}
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onStart={handleStart}
      />
      
      <SharePomodoroDialog
        session={shareDialogFor}
        onOpenChange={(v) => !v && setShareDialogFor(null)}
        onShare={(text) => {
          if (shareDialogFor) {
            sharePomodoroToSocial(shareDialogFor.id, text)
            toast.success('به فید سوشال اضافه شد')
            setShareDialogFor(null)
          }
        }}
      />
    </div>
  )
}

function ActivePomodoroCard({
  session, remainingSeconds, onPause, onResume, onStop,
}: {
  session: PomodoroSession
  remainingSeconds: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
}) {
  const isWork = session.currentPhase === 'work'
  const isRunning = session.status === 'work' || session.status === 'break'
  const totalSeconds = isWork ? session.workMinutes * 60 : session.breakMinutes * 60
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100
  
  return (
    <Card className={`p-6 mb-4 border-2 ${isWork ? 'border-primary/30 bg-primary/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
      <div className="flex items-center justify-between mb-4">
        <Badge
          className={`${isWork ? 'bg-primary/15 text-primary' : 'bg-emerald-500/15 text-emerald-600'} gap-1`}
        >
          {isWork ? <Brain className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
          {isWork ? 'زمان کار' : 'زمان استراحت'}
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍅</span>
          <span className="font-bold">{toPersianDigits(session.cycleCount)}</span>
        </div>
      </div>
      
      {/* دایره پیشرفت */}
      <div className="relative my-6 flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted opacity-20"
          />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={isWork ? 'currentColor' : '#10b981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            className={isWork ? 'text-primary' : ''}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-mono font-bold tabular-nums">
            {formatSeconds(remainingSeconds)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`h-2 w-2 rounded-full ${isRunning ? (isWork ? 'bg-primary animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-amber-500'}`}
            />
            <span className="text-xs text-muted-foreground">
              {isRunning ? (isWork ? 'در حال کار' : 'در حال استراحت') : 'متوقف موقت'}
            </span>
          </div>
        </div>
      </div>
      
      {/* تنظیمات */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Brain className="h-3.5 w-3.5" />
          کار: {toPersianDigits(session.workMinutes)} دقیقه
        </span>
        <span className="flex items-center gap-1">
          <Coffee className="h-3.5 w-3.5" />
          استراحت: {toPersianDigits(session.breakMinutes)} دقیقه
        </span>
      </div>
      
      {/* دکمه‌ها */}
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
          پایان
        </Button>
      </div>
    </Card>
  )
}

function PomodoroSessionCard({
  session, onDelete, onShare,
}: {
  session: PomodoroSession
  onDelete: () => void
  onShare: () => void
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🍅</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{toPersianDigits(session.workMinutes)}/{toPersianDigits(session.breakMinutes)} پومودورو</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="text-xs h-5">
              {toPersianDigits(session.cycleCount)} چرخه
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatJalaliDate(new Date(session.startedAt), false)}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare}>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

function NewPomodoroDialog({
  open, onOpenChange, onStart,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onStart: (data: { workMinutes: number; breakMinutes: number; soundEnabled: boolean; soundId: string; volume: number; vibrate: boolean }) => void
}) {
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundId, setSoundId] = useState('bell')
  const [volume, setVolume] = useState(70)
  const [vibrate, setVibrate] = useState(true)
  
  // presets
  const presets = [
    { work: 25, break: 5, label: 'کلاسیک ۲۵/۵' },
    { work: 50, break: 10, label: 'طولانی ۵۰/۱۰' },
    { work: 15, break: 3, label: 'کوتاه ۱۵/۳' },
    { work: 45, break: 15, label: 'عمیق ۴۵/۱۵' },
  ]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle className="text-right">پومودورو جدید</DialogTitle>
          <DialogDescription className="text-right">
            چرخه کار و استراحت بی‌نهایت تا وقتی خودت متوقف کنی
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* presets */}
          <div className="space-y-2">
            <Label>پیش‌تنظیم‌ها</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const selected = workMinutes === p.work && breakMinutes === p.break
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setWorkMinutes(p.work); setBreakMinutes(p.break) }}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      selected ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* زمان کار */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                زمان کار (دقیقه)
              </Label>
              <span className="text-2xl font-bold">{toPersianDigits(workMinutes)}</span>
            </div>
            <Slider value={[workMinutes]} onValueChange={(v) => setWorkMinutes(v[0])} min={5} max={90} step={5} />
          </div>
          
          {/* زمان استراحت */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                زمان استراحت (دقیقه)
              </Label>
              <span className="text-2xl font-bold">{toPersianDigits(breakMinutes)}</span>
            </div>
            <Slider value={[breakMinutes]} onValueChange={(v) => setBreakMinutes(v[0])} min={1} max={30} step={1} />
          </div>
          
          {/* صدا */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Bell className="h-4 w-4" />
                نوتیف پایان هر فاز
              </Label>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            
            {soundEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">صدای نوتیف</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {NOTIFICATION_SOUNDS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSoundId(s.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          soundId === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                        }`}
                      >
                        <Music className="h-3.5 w-3.5" />
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">بلندی</Label>
                    <span className="text-xs font-medium">{toPersianDigits(volume)}٪</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} min={0} max={100} step={5} className="flex-1" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2 cursor-pointer">
                    <Vibrate className="h-3.5 w-3.5" />
                    ویبره
                  </Label>
                  <Switch checked={vibrate} onCheckedChange={setVibrate} />
                </div>
                
                <Button variant="outline" size="sm" onClick={() => testSound(soundId, 'alarm', volume)} className="w-full">
                  تست صدا
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button className="flex-1" onClick={() => onStart({ workMinutes, breakMinutes, soundEnabled, soundId, volume, vibrate })}>
              <Play className="h-4 w-4 ml-2" />
              شروع
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SharePomodoroDialog({
  session, onOpenChange, onShare,
}: {
  session: PomodoroSession | null
  onOpenChange: (v: boolean) => void
  onShare: (text: string) => void
}) {
  if (!session) return null
  
  return (
    <SharePomodoroDialogInner
      key={session.id}
      session={session}
      onOpenChange={onOpenChange}
      onShare={onShare}
    />
  )
}

function SharePomodoroDialogInner({
  session, onOpenChange, onShare,
}: {
  session: PomodoroSession
  onOpenChange: (v: boolean) => void
  onShare: (text: string) => void
}) {
  const [text, setText] = useState(`🍅 ${toPersianDigits(session.cycleCount)} چرخه پومودورو کامل کردم! (${toPersianDigits(session.workMinutes)} دقیقه کار / ${toPersianDigits(session.breakMinutes)} دقیقه استراحت)`)
  
  return (
    <Dialog open={!!session} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">اشتراک‌گذاری پومودورو</DialogTitle>
          <DialogDescription className="text-right">
            این دستاورد رو در فید سوشال به اشتراک بگذار
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-2">
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍅</span>
              <div>
                <p className="font-semibold">{toPersianDigits(session.cycleCount)} چرخه</p>
                <p className="text-xs text-muted-foreground">
                  {toPersianDigits(session.workMinutes)} کار / {toPersianDigits(session.breakMinutes)} استراحت
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>متن پست</Label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[80px] p-3 rounded-md border border-input bg-transparent text-sm resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button className="flex-1" onClick={() => onShare(text)}>
              <Share2 className="h-4 w-4 ml-2" />
              اشتراک‌گذاری
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
