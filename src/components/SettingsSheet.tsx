'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Bell, Volume2, Vibrate, Moon, Sun, Monitor, Calendar,
  Music, Play, BellOff, TestTube, RotateCcw, Download, Smartphone, Share,
} from 'lucide-react'
import { useTaskStore } from '@/lib/store'
import { NOTIFICATION_SOUNDS, NotificationType, NOTIFICATION_TYPE_LABELS } from '@/lib/types'
import { testSound } from '@/lib/sounds'
import { requestNotificationPermission, testNotification } from '@/lib/notifications'
import { toPersianDigits } from '@/lib/jalali'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

// گوش دادن به رویداد beforeinstallprompt (در سطح ماژول)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    window.dispatchEvent(new Event('install-prompt-available'))
  })
}

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { settings, updateSettings, resetSettings } = useTaskStore()
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  
  // چک کردن وضعیت نصب
  useEffect(() => {
    // چک کردن standalone mode (نصب شده)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      const iosStandalone = (window.navigator as any).standalone === true
      setIsInstalled(standalone || iosStandalone)
    }
    checkInstalled()
    
    // چک کردن امکان نصب
    const checkInstall = () => {
      setCanInstall(deferredPrompt !== null)
    }
    checkInstall()
    
    const onAvailable = () => setCanInstall(true)
    window.addEventListener('install-prompt-available', onAvailable)
    
    // پایش تغییر display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handler = () => checkInstalled()
    mediaQuery.addEventListener('change', handler)
    
    return () => {
      window.removeEventListener('install-prompt-available', onAvailable)
      mediaQuery.removeEventListener('change', handler)
    }
  }, [open])
  
  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info('برای نصب، از منوی مرورگر گزینه "Add to Home screen" را انتخاب کنید')
      return
    }
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      toast.success('اپ نصب شد!')
      setIsInstalled(true)
    }
    deferredPrompt = null
    setCanInstall(false)
  }
  
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'یادآور تسک‌ها',
          text: 'اپ مدیریت تسک‌ها با نوتیف قابل شخصی‌سازی',
          url,
        })
      } catch (err) {
        // کاربر لغو کرد
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('لینک کپی شد')
      } catch {
        toast.error('امکان کپی لینک نبود')
      }
    }
  }
  
  const permission = typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'unsupported'
  
  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission()
    if (perm === 'granted') {
      toast.success('دسترسی نوتیفیکیشن داده شد')
    } else if (perm === 'denied') {
      toast.error('دسترسی نوتیفیکیشن رد شد. از تنظیمات مرورگر فعال کنید')
    }
  }
  
  const handleTestNotification = () => {
    testNotification({
      title: 'تست نوتیفیکیشن',
      notificationText: 'این یک نوتیف تست است',
      notificationType: settings.defaultNotificationType,
      notificationSound: settings.defaultSound,
      notificationVolume: settings.defaultVolume,
      notificationVibrate: settings.defaultVibrate,
    })
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] max-h-[90vh] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-4 border-b shrink-0">
          <SheetTitle className="text-right text-xl">تنظیمات</SheetTitle>
          <SheetDescription className="text-right">
            تنظیمات کلی اپلیکیشن
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-5 pb-8">
            {/* تم */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">ظاهر</h3>
              <div className="space-y-2">
                <Label>تم اپلیکیشن</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'light', label: 'روشن', icon: Sun },
                    { value: 'dark', label: 'تاریک', icon: Moon },
                    { value: 'system', label: 'سیستم', icon: Monitor },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateSettings({ theme: opt.value })}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-all ${
                        settings.theme === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent bg-muted text-muted-foreground'
                      }`}
                    >
                      <opt.icon className="h-5 w-5" />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            
            <Separator />
            
            {/* تقویم */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">تقویم</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="jalali" className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  استفاده از تقویم جلالی
                </Label>
                <Switch
                  id="jalali"
                  checked={settings.useJalaliCalendar}
                  onCheckedChange={(v) => updateSettings({ useJalaliCalendar: v })}
                />
              </div>
            </section>
            
            <Separator />
            
            {/* نوتیفیکیشن */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">نوتیفیکیشن</h3>
              
              {/* دسترسی */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    دسترسی نوتیفیکیشن
                  </Label>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      permission === 'granted'
                        ? 'bg-primary/15 text-primary'
                        : permission === 'denied'
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {permission === 'granted'
                      ? 'فعال'
                      : permission === 'denied'
                      ? 'رد شده'
                      : permission === 'unsupported'
                      ? 'پشتیبانی نمی‌شود'
                      : 'در انتظار'}
                  </span>
                </div>
                {permission !== 'granted' && permission !== 'unsupported' && (
                  <Button size="sm" variant="outline" onClick={handleRequestPermission} className="w-full">
                    درخواست دسترسی
                  </Button>
                )}
                {permission === 'denied' && (
                  <p className="text-xs text-muted-foreground">
                    برای فعال‌سازی، به تنظیمات مرورگر بروید و دسترسی Notification را Allow کنید
                  </p>
                )}
              </div>
              
              {/* نوع پیش‌فرض */}
              <div className="space-y-2">
                <Label>نوع پیش‌فرض نوتیفیکیشن</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['default', 'alarm', 'call', 'silent'] as NotificationType[]).map((t) => {
                    const selected = settings.defaultNotificationType === t
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateSettings({ defaultNotificationType: t })}
                        className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          selected ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                        }`}
                      >
                        {NOTIFICATION_TYPE_LABELS[t]}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* صدای پیش‌فرض */}
              {settings.defaultNotificationType !== 'silent' && (
                <>
                  <div className="space-y-2">
                    <Label>صدای پیش‌فرض</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {NOTIFICATION_SOUNDS.map((s) => {
                        const selected = settings.defaultSound === s.id
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateSettings({ defaultSound: s.id })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                              selected ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                            }`}
                          >
                            <Music className="h-3.5 w-3.5" />
                            {s.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* بلندی */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>بلندی پیش‌فرض</Label>
                      <span className="text-sm font-medium">
                        {toPersianDigits(settings.defaultVolume)}٪
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={[settings.defaultVolume]}
                        onValueChange={(v) => updateSettings({ defaultVolume: v[0] })}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  {/* ویبره */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="def-vibrate" className="flex items-center gap-2 cursor-pointer">
                      <Vibrate className="h-4 w-4" />
                      ویبره پیش‌فرض
                    </Label>
                    <Switch
                      id="def-vibrate"
                      checked={settings.defaultVibrate}
                      onCheckedChange={(v) => updateSettings({ defaultVibrate: v })}
                    />
                  </div>
                  
                  {/* تست */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => testSound(settings.defaultSound, settings.defaultNotificationType, settings.defaultVolume)}
                    >
                      <Play className="h-4 w-4 ml-2" />
                      تست صدا
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleTestNotification}
                    >
                      <TestTube className="h-4 w-4 ml-2" />
                      تست نوتیف
                    </Button>
                  </div>
                </>
              )}
            </section>
            
            <Separator />
            
            {/* مرتب‌سازی */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">مرتب‌سازی تسک‌ها</h3>
              <div className="space-y-2">
                <Label>مرتب‌سازی بر اساس</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'dueDate', label: 'تاریخ سررسید' },
                    { value: 'priority', label: 'اولویت' },
                    { value: 'createdAt', label: 'تاریخ ایجاد' },
                    { value: 'title', label: 'عنوان' },
                  ] as const).map((opt) => {
                    const selected = settings.sortTasksBy === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateSettings({ sortTasksBy: opt.value })}
                        className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          selected ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>جهت</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ sortDirection: 'asc' })}
                    className={`py-2 rounded-lg border-2 text-sm transition-all ${
                      settings.sortDirection === 'asc'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent bg-muted text-muted-foreground'
                    }`}
                  >
                    صعودی
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ sortDirection: 'desc' })}
                    className={`py-2 rounded-lg border-2 text-sm transition-all ${
                      settings.sortDirection === 'desc'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent bg-muted text-muted-foreground'
                    }`}
                  >
                    نزولی
                  </button>
                </div>
              </div>
            </section>
            
            <Separator />
            
            {/* نصب اپ */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">نصب روی موبایل</h3>
              
              {isInstalled ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-semibold">اپ نصب شده است ✓</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    این اپ از روی صفحه خانه موبایلت در دسترس است. برای نوتیفیکیشن‌های بهتر، مطمئن شو دسترسی Notification فعال است.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    <span className="font-semibold">این اپ قابل نصب است</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    این یک وب‌اپ (PWA) است که مثل اپلیکیشن نیتیو روی موبایل نصب می‌شود - آیکن روی صفحه خانه، اجرای فول‌اسکرین، کار آفلاین.
                  </p>
                  
                  {canInstall && (
                    <Button onClick={handleInstall} className="w-full">
                      <Download className="h-4 w-4 ml-2" />
                      نصب اپ
                    </Button>
                  )}
                  
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                      راهنمای نصب دستی
                    </summary>
                    <div className="mt-3 space-y-2 text-muted-foreground leading-relaxed pr-2">
                      <p className="font-medium text-foreground">اندروید (Chrome):</p>
                      <p>۱. منوی سه‌نقطه (⋮) بالا را بزن</p>
                      <p>۲. <span className="font-medium">Add to Home screen</span> یا <span className="font-medium">Install app</span> را انتخاب کن</p>
                      <p>۳. روی <span className="font-medium">Install</span> بزن</p>
                      
                      <p className="font-medium text-foreground mt-3">iOS (Safari):</p>
                      <p>۱. دکمه Share (به اشتراک‌گذاری) پایین را بزن</p>
                      <p>۲. <span className="font-medium">Add to Home Screen</span> را انتخاب کن</p>
                      <p>۳. روی <span className="font-medium">Add</span> بزن</p>
                    </div>
                  </details>
                  
                  <Button variant="outline" size="sm" onClick={handleShare} className="w-full">
                    <Share className="h-4 w-4 ml-2" />
                    اشتراک‌گذاری لینک
                  </Button>
                </div>
              )}
            </section>
            
            <Separator />
            
            {/* بازنشانی */}
            <section>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('آیا مطمئن هستید؟ تنظیمات به حالت پیش‌فرض برمی‌گردد')) {
                    resetSettings()
                    toast.success('تنظیمات بازنشانی شد')
                  }
                }}
              >
                <RotateCcw className="h-4 w-4 ml-2" />
                بازنشانی تنظیمات
              </Button>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
