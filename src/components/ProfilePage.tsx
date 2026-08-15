'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Pencil, Mail, MapPin, Briefcase, User, Calendar,
  Weight, Ruler, Save, Share2, Clock, CheckCircle2,
} from 'lucide-react'
import { useExtendedStore } from '@/lib/extended-store'
import { useTaskStore } from '@/lib/store'
import { UserProfile } from '@/lib/social-types'
import { toPersianDigits, formatJalaliDate } from '@/lib/jalali'
import { formatDurationHuman } from '@/lib/time-format'
import { toast } from 'sonner'
import { ThemeSelector } from './ThemeSelector'

const AVATAR_EMOJIS = ['👤', '👨', '👩', '🧑', '👦', '👧', '👴', '👵', '🧔', '👨', '👩', '🧑', '🎓', '💼', '💻', '🔬', '🦸', '🦹', '🧙', '🧙']

export function ProfilePage() {
  const { profile, updateProfile, timerSessions } = useExtendedStore()
  const { tasks } = useTaskStore()
  const [editOpen, setEditOpen] = useState(false)
  
  const completedTasks = tasks.filter((t) => t.completed)
  const completedTimers = timerSessions.filter((t) => t.status === 'completed')
  const totalTimerSeconds = completedTimers.reduce((sum, t) => sum + t.elapsedSeconds, 0)
  
  const handleShare = async () => {
    const text = `پروفایل من در اپ یادآور تسک‌ها:\n${profile.name}\n${profile.bio || ''}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'پروفایل من', text })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        toast.success('اطلاعات کپی شد')
      } catch {
        toast.error('امکان کپی نبود')
      }
    }
  }
  
  return (
    <div className="px-4 py-4">
      {/* کارت پروفایل */}
      <Card className="p-6 text-center relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 h-8 w-8"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-24 w-24 mx-auto mb-3">
          <AvatarFallback className="text-4xl bg-primary/10">
            {profile.avatarType === 'image' ? (
              <img src={profile.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.avatar
            )}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-bold">
          {profile.name || 'بدون نام'}
        </h2>
        {profile.job && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {profile.job}
          </p>
        )}
        {profile.location && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {profile.location}
          </p>
        )}
        
        {profile.bio && (
          <p className="text-sm mt-3 px-4 leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}
        
        <Button variant="outline" size="sm" className="mt-4" onClick={handleShare}>
          <Share2 className="h-4 w-4 ml-2" />
          اشتراک‌گذاری
        </Button>
      </Card>
      
      {/* اطلاعات شخصی */}
      <Card className="p-4 mt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />
          اطلاعات شخصی
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {profile.age > 0 && (
            <InfoItem icon={<Calendar className="h-4 w-4" />} label="سن" value={`${toPersianDigits(profile.age)} سال`} />
          )}
          {profile.gender && (
            <InfoItem icon={<User className="h-4 w-4" />} label="جنسیت" value={
              profile.gender === 'male' ? 'مرد' : profile.gender === 'female' ? 'زن' : 'سایر'
            } />
          )}
          {profile.weight > 0 && (
            <InfoItem icon={<Weight className="h-4 w-4" />} label="وزن" value={`${toPersianDigits(profile.weight)} کیلوگرم`} />
          )}
          {profile.height > 0 && (
            <InfoItem icon={<Ruler className="h-4 w-4" />} label="قد" value={`${toPersianDigits(profile.height)} سانتی‌متر`} />
          )}
        </div>
        {profile.email && (
          <div className="mt-3 pt-3 border-t">
            <InfoItem icon={<Mail className="h-4 w-4" />} label="ایمیل" value={profile.email} />
          </div>
        )}
      </Card>
      
      {/* تم رنگی */}
      <div className="mt-4">
        <ThemeSelector />
      </div>
      
      {/* آمار */}
      <Card className="p-4 mt-4">
        <h3 className="font-semibold mb-3">آمار فعالیت</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatItem
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={toPersianDigits(completedTasks.length)}
            label="تسک انجام شده"
            color="text-primary"
          />
          <StatItem
            icon={<Clock className="h-5 w-5" />}
            value={toPersianDigits(completedTimers.length)}
            label="جلسه تایمر"
            color="text-blue-500"
          />
          <StatItem
            icon={<Clock className="h-5 w-5" />}
            value={formatDurationHuman(totalTimerSeconds)}
            label="کل زمان"
            color="text-amber-500"
            small
          />
        </div>
      </Card>
      
      {/* عضویت از */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        عضو از {formatJalaliDate(new Date(profile.createdAt), false)}
      </p>
      
      <ProfileEditDialog
        key={editOpen ? 'open' : 'closed'}
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSave={(updates) => {
          updateProfile(updates)
          toast.success('پروفایل ذخیره شد')
          setEditOpen(false)
        }}
      />
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function StatItem({ icon, value, label, color, small }: { icon: React.ReactNode; value: string; label: string; color: string; small?: boolean }) {
  return (
    <div className="text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className={`font-bold ${small ? 'text-xs' : 'text-lg'}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ProfileEditDialog({
  open, onOpenChange, profile, onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  profile: UserProfile
  onSave: (updates: Partial<UserProfile>) => void
}) {
  // مقادیر اولیه از پروفایل - با key remount می‌شود
  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(String(profile.age || ''))
  const [weight, setWeight] = useState(String(profile.weight || ''))
  const [height, setHeight] = useState(String(profile.height || ''))
  const [job, setJob] = useState(profile.job)
  const [bio, setBio] = useState(profile.bio)
  const [email, setEmail] = useState(profile.email)
  const [location, setLocation] = useState(profile.location)
  const [gender, setGender] = useState<UserProfile['gender']>(profile.gender)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [avatarType, setAvatarType] = useState<'emoji' | 'image'>(profile.avatarType)
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('تصویر باید کمتر از ۲ مگابایت باشد')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result as string)
      setAvatarType('image')
    }
    reader.readAsDataURL(file)
  }
  
  const handleSave = () => {
    onSave({
      name: name.trim(),
      age: parseInt(age) || 0,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      job: job.trim(),
      bio: bio.trim(),
      email: email.trim(),
      location: location.trim(),
      gender,
      avatar,
      avatarType,
    })
  }
  
  const handleConnectGmail = () => {
    // شبیه‌سازی اتصال به Gmail
    const gmailInput = prompt('ایمیل Gmail خود را وارد کنید:', email || '')
    if (gmailInput && gmailInput.includes('@')) {
      setEmail(gmailInput.trim())
      toast.success('Gmail متصل شد')
    } else if (gmailInput !== null) {
      toast.error('ایمیل نامعتبر است')
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle className="text-right">ویرایش پروفایل</DialogTitle>
          <DialogDescription className="text-right">
            اطلاعات خود را وارد کنید
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* آواتار */}
          <div className="space-y-2">
            <Label>آواتار</Label>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-2xl bg-primary/10">
                  {avatarType === 'image' ? (
                    <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label htmlFor="avatar-upload" asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    آپلود تصویر
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">حداکثر ۲ مگابایت</p>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setAvatar(e); setAvatarType('emoji') }}
                  className={`aspect-square text-2xl rounded-md border-2 transition-all flex items-center justify-center ${
                    avatar === e && avatarType === 'emoji' ? 'border-primary bg-primary/10' : 'border-transparent bg-muted'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          
          {/* نام */}
          <div className="space-y-2">
            <Label>نام و نام خانوادگی</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام شما" />
          </div>
          
          {/* سن، وزن، قد */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>سن</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="۲۰" />
            </div>
            <div className="space-y-2">
              <Label>وزن (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="۷۰" />
            </div>
            <div className="space-y-2">
              <Label>قد (cm)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="۱۷۰" />
            </div>
          </div>
          
          {/* جنسیت */}
          <div className="space-y-2">
            <Label>جنسیت</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'male', label: 'مرد' },
                { value: 'female', label: 'زن' },
                { value: 'other', label: 'سایر' },
              ] as const).map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={`py-2 rounded-lg border-2 text-sm transition-all ${
                    gender === g.value ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-muted text-muted-foreground'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* شغل */}
          <div className="space-y-2">
            <Label>شغل</Label>
            <Input value={job} onChange={(e) => setJob(e.target.value)} placeholder="مثلا: دانشجو" />
          </div>
          
          {/* موقعیت */}
          <div className="space-y-2">
            <Label>موقعیت</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="مثلا: تهران" />
          </div>
          
          {/* ایمیل / Gmail */}
          <div className="space-y-2">
            <Label>ایمیل (Gmail)</Label>
            <div className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" className="flex-1" />
              <Button variant="outline" size="icon" onClick={handleConnectGmail} type="button">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              برای ذخیره اکانت و همگام‌سازی، Gmail خود را وارد کنید
            </p>
          </div>
          
          {/* بیو */}
          <div className="space-y-2">
            <Label>درباره من</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="چند کلمه درباره خودت..." rows={3} />
          </div>
          
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              <Save className="h-4 w-4 ml-2" />
              ذخیره
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
