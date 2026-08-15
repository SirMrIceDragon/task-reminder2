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
  Plus, Trash2, Bell, BellOff, Clock, Music, Volume2, Vibrate,
  Upload, Play, AlarmClock, AlarmClockOff,
} from 'lucide-react'
import { useExtendedStore } from '@/lib/extended-store'
import { Alarm } from '@/lib/social-types'
import { NOTIFICATION_SOUNDS } from '@/lib/types'
import { playNotificationSound, testSound } from '@/lib/sounds'
import { playCustomSound, fileToBase64 } from '@/lib/custom-sound'
import { toPersianDigits } from '@/lib/jalali'
import { toast } from 'sonner'

const WEEKDAY_NAMES = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
const WEEKDAY_SHORT = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']
const EMOJI_OPTIONS = ['⏰', '🔔', '☀️', '📚', '💼', '🎯', '☕', '🎬', '🎮', '💊', '✏️', '💻', '🎨', '🎵', '💡', '❤️']

export function AlarmPage() {
  const { alarms, addAlarm, deleteAlarm, toggleAlarm, updateAlarm } = useExtendedStore()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [now, setNow] = useState(new Date())
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null)
  const ringHandleRef = useRef<{ stop: () => void } | null>(null)
  
  // آپدیت ساعت هر ثانیه
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  
  const triggerAlarm = useCallback((alarm: Alarm) => {
    setRingingAlarm(alarm)
    
    if (alarm.soundType === 'custom' && alarm.customSoundData) {
      ringHandleRef.current = playCustomSound(
        alarm.customSoundData,
        alarm.volume,
        alarm.vibrate,
        true // loop
      )
    } else {
      // صدای پیش‌فرض - loop با setInterval
      const soundId = alarm.soundId || 'bell'
      const playOnce = () => {
        playNotificationSound({
          soundId,
          type: 'alarm',
          volume: alarm.volume,
          vibrate: alarm.vibrate,
        })
      }
      playOnce()
      const intervalId = setInterval(playOnce, 2000)
      ringHandleRef.current = {
        stop: () => {
          clearInterval(intervalId)
          if ('vibrate' in navigator) navigator.vibrate(0)
        },
      }
    }
    
    // اگر یک‌بار است، غیرفعال کن
    if (alarm.repeatDays.length === 0) {
      toggleAlarm(alarm.id)
    }
  }, [toggleAlarm])
  
  // چک کردن آلارم‌ها
  const lastCheckedMinute = useRef<string>('')
  useEffect(() => {
    const timeStr = `${now.getHours()}:${now.getMinutes()}`
    if (lastCheckedMinute.current === timeStr) return
    lastCheckedMinute.current = timeStr
    
    for (const alarm of alarms) {
      if (!alarm.enabled) continue
      
      const [ah, am] = alarm.time.split(':').map(Number)
      if (ah === now.getHours() && am === now.getMinutes()) {
        // چک کردن روز هفته
        if (alarm.repeatDays.length === 0 || alarm.repeatDays.includes(now.getDay())) {
          // آلارم بوق! - از setTimeout برای جلوگیری از setState در effect
          const alarmToTrigger = alarm
          setTimeout(() => triggerAlarm(alarmToTrigger), 0)
          break
        }
      }
    }
  }, [now, alarms, triggerAlarm])
  
  function stopAlarm() {
    if (ringHandleRef.current) {
      ringHandleRef.current.stop()
      ringHandleRef.current = null
    }
    setRingingAlarm(null)
  }
  
  function snoozeAlarm() {
    if (!ringingAlarm) return
    // ایجاد آلارم موقت برای ۵ دقیقه بعد
    const snoozeDate = new Date(now.getTime() + (ringingAlarm.snoozeMinutes || 5) * 60000)
    const snoozeTime = `${String(snoozeDate.getHours()).padStart(2, '0')}:${String(snoozeDate.getMinutes()).padStart(2, '0')}`
    // ذخیره در state محلی برای چک بعدی
    // در واقع این ساده‌ترین راه است: یک timeout تنظیم کنیم
    setTimeout(() => {
      setRingingAlarm(ringingAlarm)
      // پخش دوباره صدا
      if (ringingAlarm.soundType === 'custom' && ringingAlarm.customSoundData) {
        ringHandleRef.current = playCustomSound(ringingAlarm.customSoundData, ringingAlarm.volume, ringingAlarm.vibrate, true)
      }
    }, (ringingAlarm.snoozeMinutes || 5) * 60000)
    
    stopAlarm()
    toast.info(`آلارم ${toPersianDigits(ringingAlarm.snoozeMinutes || 5)} دقیقه تعویق شد`)
  }
  
  const enabledCount = alarms.filter((a) => a.enabled).length
  
  return (
    <div className="px-4 py-4">
      {/* ساعت بزرگ */}
      <Card className="p-6 text-center mb-4">
        <div className="text-5xl font-mono font-bold tabular-nums">
          {toPersianDigits(String(now.getHours()).padStart(2, '0'))}:{toPersianDigits(String(now.getMinutes()).padStart(2, '0'))}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {WEEKDAY_NAMES[now.getDay()]} - {toPersianDigits(String(now.getSeconds()).padStart(2, '0'))} ثانیه
        </div>
      </Card>
      
      {/* دکمه آلارم جدید */}
      <Button
        onClick={() => setShowNewDialog(true)}
        className="w-full h-12 mb-4"
      >
        <Plus className="h-5 w-5 ml-2" />
        آلارم جدید
      </Button>
      
      {/* لیست آلارم‌ها */}
      {alarms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlarmClock className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">هنوز آلارمی تنظیم نکرده‌اید</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            {toPersianDigits(alarms.length)} آلارم · {toPersianDigits(enabledCount)} فعال
          </p>
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onToggle={() => toggleAlarm(alarm.id)}
              onDelete={() => deleteAlarm(alarm.id)}
            />
          ))}
        </div>
      )}
      
      <NewAlarmDialog
        key={showNewDialog ? 'open' : 'closed'}
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSave={(data) => {
          addAlarm(data)
          toast.success('آلارم اضافه شد')
          setShowNewDialog(false)
        }}
      />
      
      {/* دیالوگ زنگ خوردن آلارم */}
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

function AlarmCard({
  alarm, onToggle, onDelete,
}: {
  alarm: Alarm
  onToggle: () => void
  onDelete: () => void
}) {
  const repeatText = alarm.repeatDays.length === 0
    ? 'یک‌بار'
    : alarm.repeatDays.length === 7
    ? 'هر روز'
    : alarm.repeatDays.length === 5 && [1, 2, 3, 4, 5].every((d) => alarm.repeatDays.includes(d))
    ? 'روزهای کاری'
    : alarm.repeatDays
        .sort()
        .map((d) => WEEKDAY_SHORT[d])
        .join('، ')
  
  return (
    <Card className={`p-4 ${!alarm.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{alarm.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">
              {toPersianDigits(alarm.time)}
            </span>
            {alarm.enabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {alarm.label && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{alarm.label}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs h-5">
              {repeatText}
            </Badge>
            {alarm.snoozeEnabled && (
              <Badge variant="outline" className="text-xs h-5 gap-1">
                <AlarmClockOff className="h-3 w-3" />
                {toPersianDigits(alarm.snoozeMinutes)} دقیقه
              </Badge>
            )}
            {alarm.soundType === 'custom' && (
              <Badge variant="outline" className="text-xs h-5 gap-1">
                <Music className="h-3 w-3" />
                سفارشی
              </Badge>
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

function NewAlarmDialog({
  open, onOpenChange, onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [time, setTime] = useState('07:00')
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⏰')
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [soundType, setSoundType] = useState<'default' | 'custom'>('default')
  const [soundId, setSoundId] = useState('bell')
  const [customSoundName, setCustomSoundName] = useState('')
  const [customSoundData, setCustomSoundData] = useState('')
  const [volume, setVolume] = useState(70)
  const [vibrate, setVibrate] = useState(true)
  const [snoozeEnabled, setSnoozeEnabled] = useState(true)
  const [snoozeMinutes, setSnoozeMinutes] = useState(5)
  
  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }
  
  const handleUploadSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('فایل صوتی باید کمتر از ۵ مگابایت باشد')
      return
    }
    try {
      const base64 = await fileToBase64(file)
      setCustomSoundData(base64)
      setCustomSoundName(file.name)
      setSoundType('custom')
      toast.success('آهنگ بارگذاری شد')
    } catch {
      toast.error('بارگذاری آهنگ ناموفق بود')
    }
  }
  
  const handleTestSound = () => {
    if (soundType === 'custom' && customSoundData) {
      playCustomSound(customSoundData, volume, vibrate)
    } else {
      testSound(soundId, 'alarm', volume)
    }
  }
  
  const handleSave = () => {
    onSave({
      time,
      label: label.trim(),
      emoji,
      enabled: true,
      repeatDays,
      soundType,
      soundId: soundType === 'default' ? soundId : undefined,
      customSoundName: soundType === 'custom' ? customSoundName : undefined,
      customSoundData: soundType === 'custom' ? customSoundData : undefined,
      volume,
      vibrate,
      snoozeEnabled,
      snoozeMinutes,
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle className="text-right">آلارم جدید</DialogTitle>
          <DialogDescription className="text-right">
            یک آلارم مثل ساعت بوق تنظیم کن
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* زمان */}
          <div className="space-y-2">
            <Label>ساعت آلارم</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-2xl text-center font-mono"
            />
          </div>
          
          {/* ایموجی */}
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
          
          {/* برچسب */}
          <div className="space-y-2">
            <Label>برچسب (اختیاری)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثلا: بیدار شو!" />
          </div>
          
          {/* تکرار روزها */}
          <div className="space-y-2">
            <Label>تکرار</Label>
            <div className="flex gap-1">
              {WEEKDAY_SHORT.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex-1 aspect-square rounded-full text-sm font-medium transition-all ${
                    repeatDays.includes(i)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {repeatDays.length === 0 ? 'فقط یک‌بار' : repeatDays.length === 7 ? 'هر روز' : `${toPersianDigits(repeatDays.length)} روز در هفته`}
            </p>
          </div>
          
          {/* صدا */}
          <div className="space-y-2">
            <Label>صدای آلارم</Label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSoundType('default')}
                className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                  soundType === 'default' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                }`}
              >
                صداهای پیش‌فرض
              </button>
              <button
                type="button"
                onClick={() => setSoundType('custom')}
                className={`px-3 py-2 rounded-lg border-2 text-sm transition-all flex items-center justify-center gap-1 ${
                  soundType === 'custom' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                آهنگ از موبایل
              </button>
            </div>
            
            {soundType === 'default' ? (
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
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUploadSound}
                  className="hidden"
                  id="alarm-sound-upload"
                />
                <Label htmlFor="alarm-sound-upload" asChild>
                  <Button variant="outline" size="sm" className="w-full cursor-pointer">
                    <Upload className="h-4 w-4 ml-2" />
                    انتخاب آهنگ
                  </Button>
                </Label>
                {customSoundName && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <Music className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm truncate flex-1">{customSoundName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => { setCustomSoundName(''); setCustomSoundData('') }}
                    >
                      ×
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  MP3, WAV, M4A - حداکثر ۵ مگابایت
                </p>
              </div>
            )}
          </div>
          
          {/* بلندی */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>بلندی صدا</Label>
              <span className="text-sm font-medium">{toPersianDigits(volume)}٪</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} min={0} max={100} step={5} className="flex-1" />
            </div>
          </div>
          
          {/* ویبره */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Vibrate className="h-4 w-4" />
              لرزش
            </Label>
            <Switch checked={vibrate} onCheckedChange={setVibrate} />
          </div>
          
          {/* snooze */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer">
                <AlarmClockOff className="h-4 w-4" />
                تعویق (Snooze)
              </Label>
              <Switch checked={snoozeEnabled} onCheckedChange={setSnoozeEnabled} />
            </div>
            {snoozeEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-sm">هر</span>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={snoozeMinutes}
                  onChange={(e) => setSnoozeMinutes(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-16 text-center"
                />
                <span className="text-sm">دقیقه</span>
              </div>
            )}
          </div>
          
          {/* تست */}
          <Button variant="outline" size="sm" onClick={handleTestSound} className="w-full">
            <Play className="h-4 w-4 ml-2" />
            تست صدا
          </Button>
          
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              ذخیره آلارم
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RingingDialog({
  alarm, onStop, onSnooze,
}: {
  alarm: Alarm
  onStop: () => void
  onSnooze: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-8xl mb-6 animate-bounce">{alarm.emoji}</div>
      <h2 className="text-3xl font-bold mb-2">{alarm.label || 'آلارم'}</h2>
      <p className="text-6xl font-mono font-bold mb-8">{toPersianDigits(alarm.time)}</p>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {alarm.snoozeEnabled && (
          <Button variant="outline" size="lg" onClick={onSnooze} className="h-14">
            <AlarmClockOff className="h-5 w-5 ml-2" />
            تعویق {toPersianDigits(alarm.snoozeMinutes)} دقیقه
          </Button>
        )}
        <Button variant="destructive" size="lg" onClick={onStop} className="h-14">
          <BellOff className="h-5 w-5 ml-2" />
          توقف
        </Button>
      </div>
    </div>
  )
}
