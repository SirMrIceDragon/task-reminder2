// فرمت ثانیه به HH:MM:SS یا فرمت خوانا

import { toPersianDigits } from './jalali'

export function formatSeconds(totalSeconds: number, persian = true): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  const h = String(hours).padStart(2, '0')
  const m = String(minutes).padStart(2, '0')
  const s = String(seconds).padStart(2, '0')
  
  const result = `${h}:${m}:${s}`
  return persian ? toPersianDigits(result) : result
}

// فرمت خلاصه: "۲ ساعت و ۱۵ دقیقه"
export function formatDurationHuman(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  const parts: string[] = []
  if (hours > 0) parts.push(`${toPersianDigits(hours)} ساعت`)
  if (minutes > 0) parts.push(`${toPersianDigits(minutes)} دقیقه`)
  if (seconds > 0 && hours === 0) parts.push(`${toPersianDigits(seconds)} ثانیه`)
  
  if (parts.length === 0) return '۰ ثانیه'
  return parts.join(' و ')
}
