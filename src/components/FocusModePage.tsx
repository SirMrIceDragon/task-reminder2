'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Brain, Play, Square, Pause, Clock, Coffee } from 'lucide-react'
import { useNewFeaturesStore } from '@/lib/features-store'
import { getQuoteOfTheDay } from '@/lib/quotes'
import { formatSeconds } from '@/lib/time-format'
import { toPersianDigits } from '@/lib/jalali'
import { toast } from 'sonner'

export function FocusModePage() {
  const { activeFocus, focusSessions, startFocus, stopFocus } = useNewFeaturesStore()
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const quote = getQuoteOfTheDay()
  
  // آپدیت تایمر
  useEffect(() => {
    if (!activeFocus) return
    const startTime = new Date(activeFocus.startedAt).getTime()
    const totalSeconds = activeFocus.durationSeconds
    
    const update = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, totalSeconds - elapsed)
      setRemainingSeconds(remaining)
      
      if (remaining === 0) {
        stopFocus(true)
        toast.success('🎉 تمرکز کامل شد! آفرین!')
      }
    }
    
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [activeFocus, stopFocus])
  
  const completedSessions = focusSessions.filter((s) => s.completed)
  const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  
  return (
    <div className="px-4 py-4 space-y-4">
      {/* تایمر فعال */}
      {activeFocus && (
        <ActiveFocusCard
          remainingSeconds={remainingSeconds}
          totalSeconds={activeFocus.durationSeconds}
          taskTitle={activeFocus.taskTitle}
          onStop={() => {
            stopFocus(false)
            toast.info('تمرکز متوقف شد')
          }}
          quote={quote.text}
        />
      )}
      
      {/* دکمه شروع */}
      {!activeFocus && (
        <Button
          onClick={() => setShowStartDialog(true)}
          className="w-full h-16 text-base"
          size="lg"
        >
          <Brain className="h-6 w-6 ml-2" />
          شروع حالت تمرکز
        </Button>
      )}
      
      {/* آمار */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <Brain className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{toPersianDigits(completedSessions.length)}</p>
            <p className="text-xs text-muted-foreground">جلسه تمرکز</p>
          </div>
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{formatSeconds(totalFocusTime, false)}</p>
            <p className="text-xs text-muted-foreground">کل زمان تمرکز</p>
          </div>
        </div>
      </Card>
      
      {/* نقل قول انگیزشی */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm font-medium text-center leading-relaxed">
          «{quote.text}»
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">— {quote.author}</p>
      </Card>
      
      {/* توضیح */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          حالت تمرکز چیست؟
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          تایمر تمرکز بهت کمک می‌کنه بدون حواس‌پرتی روی یه کار متمرکز بشی. در این مدت:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 pr-4">
          <li>• نوتیف‌های غیرضروری رو نادیده بگیر</li>
          <li>• فقط روی یه کار تمرکز کن</li>
          <li>• بعد از پایان، حس موفقیت رو تجربه کن</li>
        </ul>
      </Card>
      
      {/* جلسات اخیر */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            جلسات اخیر ({toPersianDigits(completedSessions.length)})
          </h2>
          <div className="space-y-2">
            {completedSessions.slice(0, 5).map((s) => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.taskTitle || 'جلسه تمرکز'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSeconds(s.durationSeconds, false)} · {new Date(s.startedAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <StartFocusDialog
        key={showStartDialog ? 'open' : 'closed'}
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        onStart={(duration, taskTitle) => {
          startFocus(duration, taskTitle)
          setShowStartDialog(false)
          toast.success('حالت تمرکز شروع شد 🧠')
        }}
      />
    </div>
  )
}

function ActiveFocusCard({
  remainingSeconds, totalSeconds, taskTitle, onStop, quote,
}: {
  remainingSeconds: number
  totalSeconds: number
  taskTitle?: string
  onStop: () => void
  quote: string
}) {
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100
  const motivationalMessages = ['متمرکز باش', 'تسلیم نشو', 'ادامه بده', 'تو می‌تونی']
  const msgIndex = Math.floor((totalSeconds - remainingSeconds) / 60) % motivationalMessages.length
  
  return (
    <Card className="p-6 border-2 border-primary/30 bg-primary/5">
      <div className="text-center mb-4">
        <Badge className="bg-primary/15 text-primary gap-1">
          <Brain className="h-3 w-3" />
          حالت تمرکز فعال
        </Badge>
        {taskTitle && (
          <p className="text-sm text-muted-foreground mt-2">{taskTitle}</p>
        )}
      </div>
      
      {/* دایره پیشرفت */}
      <div className="relative my-6 flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
          <circle
            cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            className="text-primary"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-mono font-bold tabular-nums">
            {formatSeconds(remainingSeconds)}
          </div>
          <p className="text-sm text-primary font-medium mt-2 animate-pulse">
            {motivationalMessages[msgIndex]}
          </p>
        </div>
      </div>
      
      {/* نقل قول */}
      <p className="text-xs text-center text-muted-foreground italic mb-4">
        «{quote}»
      </p>
      
      <Button onClick={onStop} variant="destructive" className="w-full h-12">
        <Square className="h-5 w-5 ml-2" />
        توقف تمرکز
      </Button>
    </Card>
  )
}

function StartFocusDialog({
  open, onOpenChange, onStart,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onStart: (duration: number, taskTitle?: string) => void
}) {
  const [duration, setDuration] = useState(25)
  const [taskTitle, setTaskTitle] = useState('')
  
  const presets = [
    { min: 15, label: 'کوتاه (۱۵ دقیقه)' },
    { min: 25, label: 'استاندارد (۲۵ دقیقه)' },
    { min: 45, label: 'عمیق (۴۵ دقیقه)' },
    { min: 60, label: 'طولانی (۶۰ دقیقه)' },
  ]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">شروع تمرکز</DialogTitle>
          <DialogDescription className="text-right">
            مدت تمرکز را انتخاب کن
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Presets */}
          <div className="space-y-2">
            <Label>پیش‌تنظیم‌ها</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.min}
                  type="button"
                  onClick={() => setDuration(p.min)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    duration === p.min ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>مدت دقیقه</Label>
              <span className="text-2xl font-bold">{toPersianDigits(duration)}</span>
            </div>
            <Slider value={[duration]} onValueChange={(v) => setDuration(v[0])} min={5} max={90} step={5} />
          </div>
          
          {/* عنوان کار */}
          <div className="space-y-2">
            <Label>عنوان کار (اختیاری)</Label>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="مثلا: مطالعه فیزیک"
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button className="flex-1" onClick={() => onStart(duration, taskTitle || undefined)}>
              <Play className="h-4 w-4 ml-2" />
              شروع
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
