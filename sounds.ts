// سیستم تولید صدای نوتیفیکیشن با Web Audio API
// انواع صدا: chime, bell, marimba, digital, cosmic, urgent

import { NotificationType } from './types'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  return audioContext
}

interface ToneOptions {
  frequency: number
  duration: number
  startTime: number
  type?: OscillatorType
  volume?: number
  attack?: number
  release?: number
}

function playTone(ctx: AudioContext, opts: ToneOptions) {
  const {
    frequency,
    duration,
    startTime,
    type = 'sine',
    volume = 0.3,
    attack = 0.005,
    release = 0.05,
  } = opts

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + attack)
  gain.gain.setValueAtTime(volume, startTime + duration - release)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration)
}

// الگوهای صدا
const SOUND_PATTERNS: Record<string, (ctx: AudioContext, t: number, vol: number) => void> = {
  chime: (ctx, t, vol) => {
    // دو نت آرام
    playTone(ctx, { frequency: 880, duration: 0.3, startTime: t, type: 'sine', volume: vol })
    playTone(ctx, { frequency: 1318.5, duration: 0.4, startTime: t + 0.15, type: 'sine', volume: vol })
  },
  bell: (ctx, t, vol) => {
    // زنگ کلیسیایی
    playTone(ctx, { frequency: 523.25, duration: 0.8, startTime: t, type: 'sine', volume: vol })
    playTone(ctx, { frequency: 659.25, duration: 0.8, startTime: t + 0.05, type: 'sine', volume: vol * 0.7 })
    playTone(ctx, { frequency: 783.99, duration: 0.8, startTime: t + 0.1, type: 'sine', volume: vol * 0.5 })
  },
  marimba: (ctx, t, vol) => {
    // ماریبا - چند نت سریع
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => {
      playTone(ctx, { frequency: f, duration: 0.15, startTime: t + i * 0.1, type: 'triangle', volume: vol, attack: 0.001, release: 0.1 })
    })
  },
  digital: (ctx, t, vol) => {
    // دیجیتال - بیپ مکرر
    for (let i = 0; i < 3; i++) {
      playTone(ctx, { frequency: 1000, duration: 0.08, startTime: t + i * 0.15, type: 'square', volume: vol * 0.6, attack: 0.001, release: 0.02 })
    }
  },
  cosmic: (ctx, t, vol) => {
    // کیهانی - فرکانس متغیر
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, t)
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.5)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.8)
  },
  urgent: (ctx, t, vol) => {
    // فوری - نت‌های تند و تیز
    for (let i = 0; i < 4; i++) {
      playTone(ctx, { frequency: 1200, duration: 0.1, startTime: t + i * 0.12, type: 'square', volume: vol * 0.7, attack: 0.001, release: 0.02 })
    }
  },
}

interface PlayOptions {
  soundId?: string
  type?: NotificationType
  volume?: number // 0 تا 100
  vibrate?: boolean
}

// پخش یک بار صدا
export function playNotificationSound(opts: PlayOptions = {}): { stop: () => void } {
  const ctx = getAudioContext()
  if (!ctx) return { stop: () => {} }

  const { soundId = 'chime', volume = 70, vibrate = true } = opts
  const vol = (volume / 100) * 0.5 // نرمال‌سازی
  const pattern = SOUND_PATTERNS[soundId] || SOUND_PATTERNS.chime

  const startTime = ctx.currentTime
  pattern(ctx, startTime, vol)

  // ویبره
  if (vibrate && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200])
    } catch {}
  }

  return {
    stop: () => {
      // صداها کوتاه هستند، stop فوری سخت است - در آینده می‌توان osc را نگه داشت
    },
  }
}

// پخش مداوم برای نوع آلارم یا کال
export interface LoopHandle {
  stop: () => void
}

export function playLoopingNotification(opts: PlayOptions = {}): LoopHandle {
  const ctx = getAudioContext()
  if (!ctx) return { stop: () => {} }

  const { soundId = 'chime', type = 'default', volume = 70, vibrate = true } = opts
  const vol = (volume / 100) * 0.5

  let stopped = false
  let timerId: number | null = null
  let vibrateTimerId: number | null = null

  // الگو بر اساس نوع
  let intervalMs = 2000 // پیش‌فرض
  if (type === 'alarm') intervalMs = 1500
  else if (type === 'call') intervalMs = 2500

  const pattern = SOUND_PATTERNS[soundId] || SOUND_PATTERNS.chime

  function playOnce() {
    if (stopped || !ctx) return
    pattern(ctx, ctx.currentTime, vol)
    
    if (type === 'call') {
      // برای کال، دو نت پشت سر هم
      setTimeout(() => {
        if (!stopped && ctx) pattern(ctx, ctx.currentTime, vol)
      }, 400)
    }
  }

  function vibratePattern() {
    if (stopped || !vibrate || !('vibrate' in navigator)) return
    try {
      if (type === 'call') {
        navigator.vibrate([800, 400, 800])
      } else if (type === 'alarm') {
        navigator.vibrate([300, 200, 300, 200, 300])
      } else {
        navigator.vibrate([200, 100, 200])
      }
    } catch {}
  }

  playOnce()
  vibratePattern()

  timerId = window.setInterval(playOnce, intervalMs)
  if (vibrate) vibrateTimerId = window.setInterval(vibratePattern, intervalMs)

  return {
    stop: () => {
      stopped = true
      if (timerId !== null) {
        clearInterval(timerId)
        timerId = null
      }
      if (vibrateTimerId !== null) {
        clearInterval(vibrateTimerId)
        vibrateTimerId = null
      }
      if ('vibrate' in navigator) {
        try { navigator.vibrate(0) } catch {}
      }
    },
  }
}

// آزمایش صدا
export function testSound(soundId: string, type: NotificationType = 'default', volume = 70) {
  return playNotificationSound({ soundId, type, volume, vibrate: false })
}

// فعال‌سازی Audio Context بعد از تعامل کاربر
export function initAudio() {
  getAudioContext()
}
