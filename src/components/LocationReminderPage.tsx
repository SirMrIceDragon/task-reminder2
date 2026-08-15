'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Plus, Trash2, MapPin, Navigation, Crosshair, AlertCircle,
} from 'lucide-react'
import { useNewFeaturesStore } from '@/lib/features-store'
import { LocationReminder } from '@/lib/new-features-types'
import { toPersianDigits } from '@/lib/jalali'
import { toast } from 'sonner'

export function LocationReminderPage() {
  const { locationReminders, addLocationReminder, deleteLocationReminder, toggleLocationReminder } = useNewFeaturesStore()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const watchIdRef = useRef<number | null>(null)
  
  // چک مکان فعلی و مقایسه با یادآورها
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    
    const checkReminders = (lat: number, lng: number) => {
      setCurrentLocation({ lat, lng })
      
      for (const reminder of locationReminders) {
        if (!reminder.enabled) continue
        
        const distance = calculateDistance(lat, lng, reminder.lat, reminder.lng)
        
        if (reminder.trigger === 'arrive' && distance < reminder.radius) {
          // نمایش نوتیف
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📍 یادآور مکان', {
              body: `به ${reminder.address} رسیدی!`,
              icon: '/icons/icon-192.png',
            })
          }
          toast.info(`📍 به ${reminder.address} رسیدی!`)
        }
      }
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => checkReminders(pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn('Location error:', err),
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 30000 }
    )
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [locationReminders])
  
  const enabledCount = locationReminders.filter((r) => r.enabled).length
  
  return (
    <div className="px-4 py-4 space-y-4">
      {/* مکان فعلی */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Crosshair className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">مکان فعلی شما</p>
            {currentLocation ? (
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {toPersianDigits(currentLocation.lat.toFixed(4))}، {toPersianDigits(currentLocation.lng.toFixed(4))}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">در حال یافتن مکان...</p>
            )}
          </div>
        </div>
      </Card>
      
      {/* دکمه یادآور جدید */}
      <Button onClick={() => setShowNewDialog(true)} className="w-full h-12">
        <Plus className="h-5 w-5 ml-2" />
        یادآور مکان جدید
      </Button>
      
      {/* هشدار دسترسی */}
      <Card className="p-3 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            برای کارکرد یادآور مکان، دسترسی موقعیت‌یاب موبایل باید روشن باشد و اپ دسترسی location داشته باشد.
          </p>
        </div>
      </Card>
      
      {/* لیست یادآورها */}
      {locationReminders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">هنوز یادآور مکانی نساختی</p>
          <p className="text-xs mt-1">مثلاً: وقتی به کتابخانه رسیدی، یادآوری کن درس بخونم</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            {toPersianDigits(locationReminders.length)} یادآور · {toPersianDigits(enabledCount)} فعال
          </p>
          {locationReminders.map((reminder) => (
            <LocationCard
              key={reminder.id}
              reminder={reminder}
              onToggle={() => toggleLocationReminder(reminder.id)}
              onDelete={() => deleteLocationReminder(reminder.id)}
            />
          ))}
        </div>
      )}
      
      <NewLocationDialog
        key={showNewDialog ? 'open' : 'closed'}
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        currentLocation={currentLocation}
        onSave={(data) => {
          addLocationReminder(data)
          toast.success('یادآور مکان اضافه شد')
          setShowNewDialog(false)
        }}
      />
    </div>
  )
}

function LocationCard({ reminder, onToggle, onDelete }: {
  reminder: LocationReminder
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{reminder.address}</p>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <Badge variant="outline" className="text-xs h-5">
              {reminder.trigger === 'arrive' ? 'ورود' : 'خروج'}
            </Badge>
            <Badge variant="outline" className="text-xs h-5">
              شعاع {toPersianDigits(reminder.radius)}م
            </Badge>
          </div>
        </div>
        <Switch checked={reminder.enabled} onCheckedChange={onToggle} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

function NewLocationDialog({ open, onOpenChange, currentLocation, onSave }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  currentLocation: { lat: number; lng: number } | null
  onSave: (data: Omit<LocationReminder, 'id' | 'createdAt'>) => void
}) {
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [radius, setRadius] = useState(100)
  const [trigger, setTrigger] = useState<'arrive' | 'leave'>('arrive')
  
  const useCurrentLocation = () => {
    if (currentLocation) {
      setLat(currentLocation.lat)
      setLng(currentLocation.lng)
      toast.success('مکان فعلی ثبت شد')
    } else {
      toast.error('مکان فعلی در دسترس نیست')
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">یادآور مکان جدید</DialogTitle>
          <DialogDescription className="text-right">
            وقتی به مکانی رسیدی یا ازش رفتی، یادآوری کن
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* آدرس */}
          <div className="space-y-2">
            <Label>نام مکان</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثلاً: کتابخانه ملی"
            />
          </div>
          
          {/* مکان */}
          <div className="space-y-2">
            <Label>موقعیت</Label>
            <Button variant="outline" size="sm" onClick={useCurrentLocation} className="w-full">
              <Crosshair className="h-4 w-4 ml-2" />
              استفاده از مکان فعلی
            </Button>
            {lat !== 0 && (
              <p className="text-xs text-muted-foreground font-mono">
                {toPersianDigits(lat.toFixed(4))}، {toPersianDigits(lng.toFixed(4))}
              </p>
            )}
          </div>
          
          {/* شعاع */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>شعاع (متر)</Label>
              <span className="text-sm font-medium">{toPersianDigits(radius)}م</span>
            </div>
            <Slider value={[radius]} onValueChange={(v) => setRadius(v[0])} min={50} max={1000} step={50} />
          </div>
          
          {/* نوع تریگر */}
          <div className="space-y-2">
            <Label>چه زمانی یادآوری کن؟</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrigger('arrive')}
                className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                  trigger === 'arrive' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                }`}
              >
                <Navigation className="h-4 w-4 ml-1 inline" />
                وقتی رسیدم
              </button>
              <button
                type="button"
                onClick={() => setTrigger('leave')}
                className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                  trigger === 'leave' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                }`}
              >
                وقتی رفتم
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (address.trim() && lat !== 0) {
                  onSave({
                    taskId: '', // مرتبط با تسک در آینده
                    lat,
                    lng,
                    radius,
                    address: address.trim(),
                    trigger,
                    enabled: true,
                  })
                }
              }}
              disabled={!address.trim() || lat === 0}
            >
              ذخیره
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// محاسبه فاصله بین دو نقطه (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // شعاع زمین به متر
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}
