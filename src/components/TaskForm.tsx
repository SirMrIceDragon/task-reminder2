'use client'

import { useState, useCallback, createElement } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Bell, Music, Volume2, Vibrate, RotateCw, X, Plus,
  Tag, Palette, Calendar, Clock, Play, AlarmClock, Phone,
} from 'lucide-react'
import {
  Task, Category, NotificationType, Priority, RepeatType,
  NOTIFICATION_SOUNDS, NOTIFICATION_TYPE_LABELS, PRIORITY_LABELS,
  REPEAT_LABELS,
} from '@/lib/types'
import { useTaskStore } from '@/lib/store'
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants'
import { getIconByName } from '@/lib/constants'
import {
  gregorianToJalali, jalaliToGregorian, toPersianDigits, toEnglishDigits,
  PERSIAN_MONTHS,
} from '@/lib/jalali'
import { testSound } from '@/lib/sounds'
import { toast } from 'sonner'
import { VoiceButton } from './VoiceButton'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTask?: Task | null
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return createElement(getIconByName(name), { className })
}

const NOTIF_TYPE_ICONS: Record<string, typeof Bell> = {
  Bell,
  AlarmClock,
  Phone,
  X,
}

function NotifTypeIcon({ name, className }: { name: string; className?: string }) {
  const Comp = NOTIF_TYPE_ICONS[name] || Bell
  return createElement(Comp, { className })
}

export function TaskForm(props: TaskFormProps) {
  // استفاده از key برای remount فرم با هر editTask جدید
  // این کار از مشکل setState در useEffect جلوگیری می‌کند
  return <TaskFormInner key={props.editTask?.id ?? 'new'} {...props} />
}

function TaskFormInner({ open, onOpenChange, editTask }: TaskFormProps) {
  const { addTask, updateTask, categories, settings } = useTaskStore()
  
  // محاسبه مقادیر اولیه
  const initial = editTask
    ? {
        title: editTask.title,
        description: editTask.description || '',
        categoryId: editTask.categoryId,
        hasTime: editTask.hasTime,
        dueDate: toLocalDateInput(new Date(editTask.dueDate)),
        dueTime: toLocalTimeInput(new Date(editTask.dueDate)),
        dueSeconds: String(new Date(editTask.dueDate).getSeconds()).padStart(2, '0'),
        priority: editTask.priority,
        tags: editTask.tags || [],
        notificationText: editTask.notificationText || '',
        notificationType: editTask.notificationType,
        notificationSound: editTask.notificationSound,
        notificationVolume: editTask.notificationVolume,
        notificationVibrate: editTask.notificationVibrate,
        recurringEnabled: editTask.recurringEnabled,
        repeatType: editTask.repeatType,
        repeatIntervalDays: editTask.repeatIntervalDays,
      }
    : (() => {
        const now = new Date()
        now.setHours(now.getHours() + 1, 0, 0, 0)
        return {
          title: '',
          description: '',
          categoryId: categories[0]?.id || 'study',
          hasTime: true,
          dueDate: toLocalDateInput(now),
          dueTime: toLocalTimeInput(now),
          dueSeconds: '00',
          priority: 'medium' as Priority,
          tags: [],
          notificationText: '',
          notificationType: settings.defaultNotificationType,
          notificationSound: settings.defaultSound,
          notificationVolume: settings.defaultVolume,
          notificationVibrate: settings.defaultVibrate,
          recurringEnabled: false,
          repeatType: 'daily' as RepeatType,
          repeatIntervalDays: 1,
        }
      })()
  
  // فیلدهای فرم - با مقدار اولیه از editTask
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [categoryId, setCategoryId] = useState(initial.categoryId)
  const [hasTime, setHasTime] = useState(initial.hasTime)
  const [dueDate, setDueDate] = useState(initial.dueDate)
  const [dueTime, setDueTime] = useState(initial.dueTime)
  const [dueSeconds, setDueSeconds] = useState(initial.dueSeconds)
  const [priority, setPriority] = useState<Priority>(initial.priority)
  const [tags, setTags] = useState<string[]>(initial.tags)
  const [tagInput, setTagInput] = useState('')
  
  // نوتیفیکیشن
  const [notificationText, setNotificationText] = useState(initial.notificationText)
  const [notificationType, setNotificationType] = useState<NotificationType>(initial.notificationType)
  const [notificationSound, setNotificationSound] = useState(initial.notificationSound)
  const [notificationVolume, setNotificationVolume] = useState(initial.notificationVolume)
  const [notificationVibrate, setNotificationVibrate] = useState(initial.notificationVibrate)
  
  // تکرار
  const [recurringEnabled, setRecurringEnabled] = useState(initial.recurringEnabled)
  const [repeatType, setRepeatType] = useState<RepeatType>(initial.repeatType)
  const [repeatIntervalDays, setRepeatIntervalDays] = useState(initial.repeatIntervalDays)
  
  // حالت استفاده از تاریخ جلالی
  const useJalali = settings.useJalaliCalendar
  
  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t))
  }
  
  const handleTestSound = () => {
    testSound(notificationSound, notificationType, notificationVolume)
  }
  
  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      toast.error('عنوان تسک را وارد کنید')
      return
    }
    
    // ساخت تاریخ ISO از مقادیر فرم
    const [hh, mm] = dueTime.split(':').map(Number)
    const ss = parseInt(dueSeconds) || 0
    const [y, m, d] = dueDate.split('-').map(Number)
    const dueDateTime = new Date(y, m - 1, d, hasTime ? hh : 0, hasTime ? mm : 0, hasTime ? ss : 0)
    
    if (isNaN(dueDateTime.getTime())) {
      toast.error('تاریخ نامعتبر است')
      return
    }
    
    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId,
      dueDate: dueDateTime.toISOString(),
      hasTime,
      completed: false,
      active: true,
      notificationText: notificationText.trim(),
      notificationType,
      notificationSound,
      notificationVolume,
      notificationVibrate,
      recurringEnabled,
      repeatType,
      repeatIntervalDays,
      priority,
      tags,
    }
    
    if (editTask) {
      updateTask(editTask.id, taskData)
      toast.success('تسک ویرایش شد')
    } else {
      addTask(taskData)
      toast.success('تسک جدید اضافه شد')
    }
    
    onOpenChange(false)
  }, [title, description, categoryId, dueDate, dueTime, dueSeconds, hasTime, notificationText, notificationType, notificationSound, notificationVolume, notificationVibrate, recurringEnabled, repeatType, repeatIntervalDays, priority, tags, editTask, addTask, updateTask, onOpenChange])
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95vh] max-h-[95vh] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-4 border-b shrink-0">
          <SheetTitle className="text-right text-xl">
            {editTask ? 'ویرایش تسک' : 'تسک جدید'}
          </SheetTitle>
          <SheetDescription className="text-right">
            {editTask ? 'جزئیات تسک را ویرایش کنید' : 'یک تسک جدید ایجاد کنید'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-5 pb-32">
            {/* عنوان */}
            <div className="space-y-2">
              <Label htmlFor="title">عنوان تسک *</Label>
              <div className="flex gap-2">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلا: مطالعه فیزیک"
                  className="text-base flex-1"
                />
                <VoiceButton
                  onResult={(text) => setTitle((prev) => prev + (prev ? ' ' : '') + text)}
                />
              </div>
            </div>
            
            {/* توضیحات */}
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات (اختیاری)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات بیشتر..."
                rows={2}
              />
            </div>
            
            {/* دسته‌بندی */}
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
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all text-sm ${
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
            
            {/* اولویت */}
            <div className="space-y-2">
              <Label>اولویت</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      priority === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent bg-muted text-muted-foreground'
                    }`}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* تاریخ و زمان */}
            <div className="space-y-3">
              <Label>تاریخ و زمان سررسید</Label>
              <div className="flex items-center gap-2 mb-2">
                <Switch
                  checked={hasTime}
                  onCheckedChange={setHasTime}
                  id="has-time"
                />
                <Label htmlFor="has-time" className="text-sm cursor-pointer">
                  تنظیم زمان دقیق (ساعت/دقیقه/ثانیه)
                </Label>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-base"
                />
                {hasTime && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        step={1}
                        className="text-base"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={dueSeconds}
                          onChange={(e) => setDueSeconds(String(e.target.value || '0').padStart(2, '0').slice(-2))}
                          className="text-base text-center"
                        />
                        <span className="text-sm text-muted-foreground shrink-0">ثانیه</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {useJalali && dueDate
                        ? (() => {
                            const [y, m, d] = dueDate.split('-').map(Number)
                            const [jy, jm, jd] = gregorianToJalali(y, m, d)
                            return `معادل جلالی: ${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
                          })()
                        : null}
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* نوتیفیکیشن */}
            <Accordion type="multiple" defaultValue={['notif']} className="w-full">
              <AccordionItem value="notif">
                <AccordionTrigger className="text-base font-semibold">
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    تنظیمات نوتیفیکیشن
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* نوع نوتیف */}
                  <div className="space-y-2">
                    <Label>نوع نوتیفیکیشن</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['default', 'alarm', 'call', 'silent'] as NotificationType[]).map((t) => {
                        const selected = notificationType === t
                        const iconName = t === 'default' ? 'Bell' : t === 'alarm' ? 'AlarmClock' : t === 'call' ? 'Phone' : 'X'
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNotificationType(t)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                              selected ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                            }`}
                          >
                            <NotifTypeIcon name={iconName} className="h-4 w-4" />
                            {NOTIFICATION_TYPE_LABELS[t]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* متن نوتیف */}
                  <div className="space-y-2">
                    <Label htmlFor="notif-text">متن دلخواه نوتیفیکیشن</Label>
                    <Textarea
                      id="notif-text"
                      value={notificationText}
                      onChange={(e) => setNotificationText(e.target.value)}
                      placeholder="مثلا: وقتشه درس بخونی! یادت نره..."
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      اگر خالی بگذارید، عنوان تسک نمایش داده می‌شود
                    </p>
                  </div>
                  
                  {notificationType !== 'silent' && (
                    <>
                      {/* صدا */}
                      <div className="space-y-2">
                        <Label>صدای نوتیفیکیشن</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {NOTIFICATION_SOUNDS.map((sound) => (
                            <button
                              key={sound.id}
                              type="button"
                              onClick={() => setNotificationSound(sound.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                                notificationSound === sound.id
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-transparent bg-muted text-muted-foreground'
                              }`}
                            >
                              <Music className="h-3.5 w-3.5" />
                              {sound.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* بلندی صدا */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>بلندی صدا</Label>
                          <span className="text-sm font-medium">
                            {toPersianDigits(notificationVolume)}٪
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            value={[notificationVolume]}
                            onValueChange={(v) => setNotificationVolume(v[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      {/* ویبره */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="vibrate" className="flex items-center gap-2 cursor-pointer">
                          <Vibrate className="h-4 w-4" />
                          لرزش موبایل
                        </Label>
                        <Switch
                          id="vibrate"
                          checked={notificationVibrate}
                          onCheckedChange={setNotificationVibrate}
                        />
                      </div>
                      
                      {/* دکمه تست */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTestSound}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 ml-2" />
                        تست صدا
                      </Button>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* تکرار روزانه */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  <Label htmlFor="recurring" className="font-semibold cursor-pointer">
                    تکرار روزانه
                  </Label>
                </div>
                <Switch
                  id="recurring"
                  checked={recurringEnabled}
                  onCheckedChange={setRecurringEnabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                اگر فعال باشد و تسک تیک نخورد، هر روز سر همان زمان به شما یادآوری می‌کند
              </p>
              
              {recurringEnabled && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>نوع تکرار</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['daily', 'weekly', 'monthly', 'custom'] as RepeatType[]).map((r) => {
                      const selected = repeatType === r
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRepeatType(r)}
                          className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selected ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                          }`}
                        >
                          {REPEAT_LABELS[r]}
                        </button>
                      )
                    })}
                  </div>
                  
                  {repeatType === 'custom' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">هر</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={repeatIntervalDays}
                        onChange={(e) => setRepeatIntervalDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                      />
                      <Label className="text-sm">روز یک‌بار</Label>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* برچسب‌ها */}
            <div className="space-y-2">
              <Label>برچسب‌ها</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="افزودن برچسب..."
                  className="flex-1"
                />
                <Button type="button" size="icon" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* نوار اکشن پایین */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 flex gap-2 safe-bottom">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button
            className="flex-[2]"
            onClick={handleSubmit}
          >
            {editTask ? 'ذخیره تغییرات' : 'ایجاد تسک'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// تبدیل Date به مقدار input[type=date]
function toLocalDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// تبدیل Date به مقدار input[type=time]
function toLocalTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
