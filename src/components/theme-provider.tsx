'use client'

import { useEffect } from 'react'
import { useTaskStore } from '@/lib/store'
import { getThemeById } from '@/lib/themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTaskStore((s) => s.settings.theme)
  const colorThemeId = useTaskStore((s) => s.settings.colorTheme)
  
  // اعمال تم تاریک/روشن
  useEffect(() => {
    const root = document.documentElement
    
    function applyTheme(isDark: boolean) {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(media.matches)
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])
  
  // اعمال تم رنگی
  useEffect(() => {
    const themeColors = getThemeById(colorThemeId)
    const root = document.documentElement
    
    // تنظیم CSS variables برای تم روشن
    root.style.setProperty('--primary', hexToOklch(themeColors.primary))
    root.style.setProperty('--primary-foreground', 'oklch(0.99 0 0)')
    root.style.setProperty('--ring', hexToOklch(themeColors.ring))
    root.style.setProperty('--sidebar-primary', hexToOklch(themeColors.primary))
    root.style.setProperty('--sidebar-ring', hexToOklch(themeColors.ring))
    
    // پالت چارت
    root.style.setProperty('--chart-1', hexToOklch(themeColors.primary))
    
    // theme-color برای status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors.primary)
    }
  }, [colorThemeId])
  
  return <>{children}</>
}

// تبدیل hex به oklch (ساده)
function hexToOklch(hex: string): string {
  // برای سادگی، hex رو به rgb تبدیل می‌کنیم و بعد یه oklch تقریبی می‌سازیم
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  // sRGB to linear
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  
  // Linear to OKLab
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  
  // OKLab to OKLCH
  const C = Math.sqrt(a * a + bLab * bLab)
  const H = Math.atan2(bLab, a) * 180 / Math.PI
  
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`
}
