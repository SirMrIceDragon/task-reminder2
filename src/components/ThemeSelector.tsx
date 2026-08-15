'use client'

import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { APP_THEMES, getThemeById } from '@/lib/themes'
import { useTaskStore } from '@/lib/store'
import { toast } from 'sonner'

export function ThemeSelector() {
  const { settings, updateSettings } = useTaskStore()
  const currentTheme = getThemeById(settings.colorTheme)
  
  const handleSelectTheme = (themeId: string) => {
    updateSettings({ colorTheme: themeId })
    const theme = getThemeById(themeId)
    toast.success(`تم ${theme.emoji} ${theme.name} اعمال شد`)
  }
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-1">🎨 تم رنگی</h3>
      <p className="text-xs text-muted-foreground mb-3">
        رنگ اپلیکیشن را انتخاب کنید (تم فعلی: {currentTheme.emoji} {currentTheme.name})
      </p>
      
      <div className="grid grid-cols-3 gap-2">
        {APP_THEMES.map((theme) => {
          const isSelected = settings.colorTheme === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-foreground scale-105'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{
                backgroundColor: `${theme.primary}15`,
              }}
            >
              {/* دایره رنگی */}
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-lg shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.primary}, ${theme.primaryDark})`,
                }}
              >
                {theme.emoji}
              </div>
              
              {/* نام تم */}
              <span
                className="text-xs font-medium text-center leading-tight"
                style={{ color: theme.primaryDark }}
              >
                {theme.name}
              </span>
              
              {/* تیک انتخاب */}
              {isSelected && (
                <div
                  className="absolute top-1 right-1 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* پیش‌نمایش رنگ‌ها */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2">پیش‌نمایش:</p>
        <div className="flex gap-2">
          <div
            className="flex-1 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: currentTheme.primary }}
          >
            دکمه اصلی
          </div>
          <div
            className="flex-1 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: currentTheme.primaryDark }}
          >
            دکمه تیره
          </div>
          <div
            className="flex-1 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: currentTheme.primaryLight }}
          >
            دکمه روشن
          </div>
        </div>
      </div>
    </Card>
  )
}
