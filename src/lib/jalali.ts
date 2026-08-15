// تبدیل تاریخ میلادی به جلالی و برعکس - الگوریتم استاندارد

import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns'
import { faIR } from 'date-fns/locale'

const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
const G_DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// تبدیل میلادی به جلالی
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy: number
  if (gy > 1600) {
    jy = 979
    gy -= 1600
  } else {
    jy = 0
    gy -= 621
  }
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

// تبدیل جلالی به میلادی
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy: number
  if (jy > 979) {
    gy = 1600
    jy -= 979
  } else {
    gy = 621
  }
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  gy += 400 * Math.floor(days / 146097)
  days %= 146097
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524)
    days %= 36524
    if (days >= 365) days++
  }
  gy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    gy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let gd = days + 1
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm]
    if (gd <= v) break
    gd -= v
  }
  return [gy, gm, gd]
}

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const PERSIAN_WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
const PERSIAN_WEEKDAYS_SHORT = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']

// تبدیل اعداد انگلیسی به فارسی
export function toPersianDigits(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(input).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

export function formatJalaliDate(date: Date, withWeekday = false): string {
  const [jy, jm, jd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
  const weekday = withWeekday ? PERSIAN_WEEKDAYS[date.getDay()] + '، ' : ''
  return `${weekday}${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
}

export function formatJalaliDateTime(date: Date): string {
  const time = format(date, 'HH:mm:ss')
  return `${formatJalaliDate(date, true)} - ${toPersianDigits(time)}`
}

export function formatJalaliTime(date: Date): string {
  return toPersianDigits(format(date, 'HH:mm'))
}

export function formatJalaliShort(date: Date): string {
  const [jy, jm, jd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
  return `${toPersianDigits(jd)}/${toPersianDigits(jm)}/${toPersianDigits(jy)}`
}

// توصیف فاصله زمانی به فارسی
export function describeDueDate(date: Date, useJalali = true): string {
  if (isToday(date)) {
    return `امروز - ${toPersianDigits(format(date, 'HH:mm'))}`
  }
  if (isTomorrow(date)) {
    return `فردا - ${toPersianDigits(format(date, 'HH:mm'))}`
  }
  if (isYesterday(date)) {
    return `دیروز - ${toPersianDigits(format(date, 'HH:mm'))}`
  }
  if (useJalali) {
    return formatJalaliDateTime(date)
  }
  return format(date, 'yyyy/MM/dd - HH:mm')
}

// نمایش فاصله نسبی (مثلا "۳ ساعت دیگر")
export function relativeTime(date: Date): string {
  try {
    const dist = formatDistanceToNow(date, { addSuffix: true, locale: faIR })
    return toPersianDigits(dist)
  } catch {
    return ''
  }
}

export function getPersianWeekday(date: Date): string {
  return PERSIAN_WEEKDAYS[date.getDay()]
}

export function getPersianMonthName(monthIndex: number): string {
  return PERSIAN_MONTHS[monthIndex] || ''
}

export { PERSIAN_MONTHS, PERSIAN_WEEKDAYS, PERSIAN_WEEKDAYS_SHORT }
