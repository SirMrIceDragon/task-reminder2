// پخش صدا - هم صداهای پیش‌فرض و هم صدای سفارشی از موبایل

let audioContext: AudioContext | null = null
const customAudioCache: Map<string, HTMLAudioElement> = new Map()

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

export function initAudio() {
  getAudioContext()
}

// پخش صدای سفارشی از base64
export function playCustomSound(
  audioData: string, // base64
  volume: number = 70,
  vibrate: boolean = true,
  loop: boolean = false
): { stop: () => void } {
  // ساخت یا استفاده از cache
  let audio = customAudioCache.get(audioData)
  if (!audio) {
    audio = new Audio(audioData)
    customAudioCache.set(audioData, audio)
  }
  
  audio.volume = Math.min(1, volume / 100)
  audio.loop = loop
  audio.currentTime = 0
  
  const playPromise = audio.play()
  if (playPromise) {
    playPromise.catch(() => {})
  }
  
  if (vibrate && 'vibrate' in navigator) {
    try {
      navigator.vibrate(loop ? [500, 200, 500] : [300, 100, 300])
    } catch {}
  }
  
  return {
    stop: () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      if (vibrate && 'vibrate' in navigator) {
        try { navigator.vibrate(0) } catch {}
      }
    },
  }
}

// پخش مداوم صدای سفارشی (برای آلارم)
export function playCustomSoundLooping(
  audioData: string,
  volume: number = 70,
  vibrate: boolean = true
): { stop: () => void } {
  return playCustomSound(audioData, volume, vibrate, true)
}

// تبدیل File به base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// دریافت طول صدا (ثانیه)
export function getAudioDuration(audioData: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(audioData)
    audio.onloadedmetadata = () => resolve(audio.duration)
    audio.onerror = () => resolve(0)
  })
}
