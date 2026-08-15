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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Plus, Trash2, Bell, BellOff, Clock, Volume2, Music, Brain,
  Puzzle, Sunrise, AlarmClockOff,
} from 'lucide-react'
import { useNewFeaturesStore } from '@/lib/features-store'
import { SmartAlarm } from '@/lib/new-features-types'
import { NOTIFICATION_SOUNDS } from '@/lib/types'
import { playNotificationSound } from '@/lib/sounds'
import { getQuoteOfTheDay } from '@/lib/quotes'
import { toPersianDigits } from '@/lib/jalali'
import { toast } from 'sonner'

const PUZZLE_TYPES = [
  { id: 'math', label: 'ریاضی', icon: Brain },
  { id: 'memory', label: 'حافظه', icon: Puzzle },
  { id: 'tap', label: 'تپ سریع', icon: Clock },
] as const

export function SmartAlarmPage() {
  const { smartAlarms, addSmartAlarm, deleteSmartAlarm, updateSmartAlarm, incrementSnooze, resetSnooze } = useNewFeaturesStore()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [now, setNow] = useState(new Date())
  const [ringingAlarm, setRingingAlarm] = useState<SmartAlarm | null>(null)
  const ringIntervalRef = useRef<number | null>(null)
  
  // آپدیت ساعت
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  
  // تریگر آلارم
  const triggerAlarm = useCallback((alarm: SmartAlarm) => {
    setRingingAlarm(alarm)
    
    // پخش صدا با افزایش تدریجی
    const playOnce = () => {
      playNotificationSound({
        soundId: alarm.soundId,
        type: 'alarm',
        volume: alarm.gradualVolume ? Math.min(alarm.maxVolume, 30) : alarm.maxVolume,
        vibrate: true,
      })
    }
    
    playOnce()
    let volumeStep = 30
    const intervalId = setInterval(() => {
      if (alarm.gradualVolume && volumeStep < alarm.maxVolume) {
        volumeStep = Math.min(alarm.maxVolume, volumeStep + 10)
      }
      playNotificationSound({
        soundId: alarm.soundId,
        type: 'alarm',
        volume: volumeStep,
        vibrate: true,
      })
    }, 2000)
    
    ringIntervalRef.current = intervalId as unknown as number
  }, [])
  
  // چک آلارم‌ها
  const lastCheckedMinute = useRef('')
  useEffect(() => {
    const timeStr = `${now.getHours()}:${now.getMinutes()}`
    if (lastCheckedMinute.current === timeStr) return
    lastCheckedMinute.current = timeStr
    
    for (const alarm of smartAlarms) {
      if (!alarm.enabled || alarm.snoozeCount >= alarm.snoozeLimit) continue
      
      const [ah, am] = alarm.time.split(':').map(Number)
      if (ah === now.getHours() && am === now.getMinutes()) {
        const alarmToTrigger = alarm
        setTimeout(() => triggerAlarm(alarmToTrigger), 0)
        break
      }
    }
  }, [now, smartAlarms, triggerAlarm])
  
  const stopAlarm = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current)
      ringIntervalRef.current = null
    }
    if (ringingAlarm) {
      resetSnooze(ringingAlarm.id)
    }
    setRingingAlarm(null)
  }
  
  const snoozeAlarm = () => {
    if (!ringingAlarm) return
    incrementSnooze(ringingAlarm.id)
    
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current)
      ringIntervalRef.current = null
    }
    setRingingAlarm(null)
    
    // snooze برای ۵ دقیقه
    setTimeout(() => {
      if (ringingAlarm) {
        setRingingAlarm(ringingAlarm)
        triggerAlarm(ringingAlarm)
      }
    }, 5 * 60 * 1000)
    
    toast.info(`آلارم ۵ دقیقه تعویق شد (${toPersianDigits(ringingAlarm.snoozeCount + 1)}/${toPersianDigits(ringingAlarm.snoozeLimit)})`)
  }
  
  const enabledCount = smartAlarms.filter((a) => a.enabled).length
  
  return (
    <div className="px-4 py-4 space-y-4">
      {/* ساعت بزرگ */}
      <Card className="p-6 text-center">
        <div className="text-5xl font-mono font-bold tabular-nums">
          {toPersianDigits(String(now.getHours()).padStart(2, '0'))}:{toPersianDigits(String(now.getMinutes()).padStart(2, '0'))}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {toPersianDigits(String(now.getSeconds()).padStart(2, '0'))} ثانیه
        </div>
      </Card>
      
      {/* دکمه آلارم جدید */}
      <Button onClick={() => setShowNewDialog(true)} className="w-full h-12">
        <Plus className="h-5 w-5 ml-2" />
        آلارم صبحگاهی جدید
      </Button>
      
      {/* لیست آلارم‌ها */}
      {smartAlarms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Sunrise className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">هنوز آلارمی تنظیم نکرده‌اید</p>
          <p className="text-xs mt-1">آلارم هوشمند با صدای نرم و معما</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            {toPersianDigits(smartAlarms.length)} آلارم · {toPersianDigits(enabledCount)} فعال
          </p>
          {smartAlarms.map((alarm) => (
            <SmartAlarmCard
              key={alarm.id}
              alarm={alarm}
              onToggle={() => updateSmartAlarm(alarm.id, { enabled: !alarm.enabled })}
              onDelete={() => deleteSmartAlarm(alarm.id)}
            />
          ))}
        </div>
      )}
      
      <NewSmartAlarmDialog
        key={showNewDialog ? 'open' : 'closed'}
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSave={(data) => {
          addSmartAlarm(data)
          toast.success('آلارم هوشمند اضافه شد')
          setShowNewDialog(false)
        }}
      />
      
      {/* دیالوگ زنگ خوردن */}
      {ringingAlarm && (
        <RingingDialog
          alarm={ringingAlarm}
          onStop={stopAlarm}
          onSnooze={snoozeAlarm}
        />
      )}
    </div>
  )
}

function SmartAlarmCard({ alarm, onToggle, onDelete }: {
  alarm: SmartAlarm
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <Card className={`p-4 ${!alarm.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <Sunrise className="h-8 w-8 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">{toPersianDigits(alarm.time)}</span>
            {alarm.enabled ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {alarm.gradualVolume && (
              <Badge variant="outline" className="text-xs h-5">صدای نرم</Badge>
            )}
            {alarm.puzzleEnabled && (
              <Badge variant="outline" className="text-xs h-5 gap-1">
                <Puzzle className="h-3 w-3" />
                {PUZZLE_TYPES.find(p => p.id === alarm.puzzleType)?.label}
              </Badge>
            )}
            {alarm.motivationalMessage && (
              <Badge variant="outline" className="text-xs h-5">پیام انگیزشی</Badge>
            )}
          </div>
        </div>
        <Switch checked={alarm.enabled} onCheckedChange={onToggle} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

function NewSmartAlarmDialog({ open, onOpenChange, onSave }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: Omit<SmartAlarm, 'id' | 'createdAt' | 'snoozeCount'>) => void
}) {
  const [time, setTime] = useState('07:00')
  const [gradualVolume, setGradualVolume] = useState(true)
  const [maxVolume, setMaxVolume] = useState(70)
  const [soundId, setSoundId] = useState('bell')
  const [puzzleEnabled, setPuzzleEnabled] = useState(true)
  const [puzzleType, setPuzzleType] = useState<'math' | 'memory' | 'tap'>('math')
  const [motivationalMessage, setMotivationalMessage] = useState(true)
  const [snoozeLimit, setSnoozeLimit] = useState(3)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle className="text-right">آلارم هوشمند صبحگاهی</DialogTitle>
          <DialogDescription className="text-right">
            بیدار شدن آرام و هوشمند
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* زمان */}
          <div className="space-y-2">
            <Label>ساعت بیداری</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-2xl text-center font-mono"
            />
          </div>
          
          {/* صدای نرم */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="h-4 w-4" />
                صدای نرم (افزایش تدریجی)
              </Label>
              <Switch checked={gradualVolume} onCheckedChange={setGradualVolume} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">بلندی نهایی</Label>
                <span className="text-xs font-medium">{toPersianDigits(maxVolume)}٪</span>
              </div>
              <Slider value={[maxVolume]} onValueChange={(v) => setMaxVolume(v[0])} min={30} max={100} step={5} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">صدای آلارم</Label>
              <div className="grid grid-cols-2 gap-1">
                {NOTIFICATION_SOUNDS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSoundId(s.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs transition-all ${
                      soundId === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                    }`}
                  >
                    <Music className="h-3 w-3" />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* معما */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Puzzle className="h-4 w-4" />
                معما برای توقف
              </Label>
              <Switch checked={puzzleEnabled} onCheckedChange={setPuzzleEnabled} />
            </div>
            
            {puzzleEnabled && (
              <div className="space-y-2">
                <Label className="text-xs">نوع معما</Label>
                <div className="grid grid-cols-3 gap-1">
                  {PUZZLE_TYPES.map((p) => {
                    const Icon = p.icon
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPuzzleType(p.id)}
                        className={`flex flex-col items-center gap-1 py-2 rounded-md border-2 text-xs transition-all ${
                          puzzleType === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* پیام انگیزشی */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Sunrise className="h-4 w-4" />
              پیام انگیزشی صبحگاهی
            </Label>
            <Switch checked={motivationalMessage} onCheckedChange={setMotivationalMessage} />
          </div>
          
          {/* snooze */}
          <div className="rounded-lg border p-3 space-y-2">
            <Label className="flex items-center gap-2">
              <AlarmClockOff className="h-4 w-4" />
              حداکثر تعویق (snooze)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="10"
                value={snoozeLimit}
                onChange={(e) => setSnoozeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">بار</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button
              className="flex-1"
              onClick={() => onSave({
                time,
                enabled: true,
                gradualVolume,
                maxVolume,
                soundId,
                puzzleEnabled,
                puzzleType,
                motivationalMessage,
                snoozeLimit,
              })}
            >
              ذخیره
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RingingDialog({ alarm, onStop, onSnooze }: {
  alarm: SmartAlarm
  onStop: () => void
  onSnooze: () => void
}) {
  const [puzzleSolved, setPuzzleSolved] = useState(false)
  const [mathA] = useState(() => Math.floor(Math.random() * 50) + 10)
  const [mathB] = useState(() => Math.floor(Math.random() * 30) + 5)
  const [answer, setAnswer] = useState('')
  const quote = getQuoteOfTheDay()
  
  const handleSolve = () => {
    if (parseInt(answer) === mathA + mathB) {
      setPuzzleSolved(true)
      onStop()
    } else {
      toast.error('جواب اشتباه است!')
      setAnswer('')
    }
  }
  
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6 animate-fade-in">
      <Sunrise className="h-20 w-20 mb-4 text-primary animate-bounce" />
      
      <h2 className="text-3xl font-bold mb-2">وقت بیداری! ☀️</h2>
      <p className="text-6xl font-mono font-bold mb-4">{toPersianDigits(alarm.time)}</p>
      
      {alarm.motivationalMessage && (
        <p className="text-sm text-center text-muted-foreground italic mb-6 max-w-xs">
          «{quote.text}»
          <br />
          <span className="text-xs">— {quote.author}</span>
        </p>
      )}
      
      {!puzzleSolved && alarm.puzzleEnabled && (
        <Card className="p-4 mb-4 w-full max-w-xs">
          <p className="text-sm text-center mb-3">برای توقف، جواب رو حساب کن:</p>
          <p className="text-3xl text-center font-mono font-bold mb-3">
            {toPersianDigits(mathA)} + {toPersianDigits(mathB)} = ؟
          </p>
          <Input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="جواب"
            className="text-center text-xl mb-2"
            autoFocus
          />
          <Button onClick={handleSolve} className="w-full" disabled={!answer}>
            تایید و توقف
          </Button>
        </Card>
      )}
      
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {alarm.snoozeCount < alarm.snoozeLimit && (
          <Button variant="outline" size="lg" onClick={onSnooze} className="h-12">
            <AlarmClockOff className="h-5 w-5 ml-2" />
            تعویق ۵ دقیقه ({toPersianDigits(alarm.snoozeCount)}/{toPersianDigits(alarm.snoozeLimit)})
          </Button>
        )}
        
        {(!alarm.puzzleEnabled || puzzleSolved) && (
          <Button variant="destructive" size="lg" onClick={onStop} className="h-14">
            <BellOff className="h-5 w-5 ml-2" />
            توقف
          </Button>
        )}
      </div>
    </div>
  )
}
