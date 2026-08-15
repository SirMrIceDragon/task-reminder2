'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Quote, RefreshCw, X } from 'lucide-react'
import { MOTIVATIONAL_QUOTES, getQuoteOfTheDay, getRandomQuote } from '@/lib/quotes'
import { useTaskStore } from '@/lib/store'
import { toPersianDigits } from '@/lib/jalali'

export function QuoteOfTheDay() {
  const { settings, updateSettings } = useTaskStore()
  const [currentQuote, setCurrentQuote] = useState(getQuoteOfTheDay())
  const [dismissed, setDismissed] = useState(false)
  
  // اگه کاربر بستش، دیگه نشون نده تا فردا
  if (dismissed || settings.language === 'en' && false) {
    return null
  }
  
  return (
    <Card className="p-3 mb-3 bg-primary/5 border-primary/20 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 left-2 text-muted-foreground hover:text-foreground"
        aria-label="بستن"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      
      <div className="flex items-start gap-2 pr-4">
        <Quote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            💭 نقل قول روز
          </p>
          <p className="text-sm leading-relaxed">
            «{currentQuote.text}»
          </p>
          <p className="text-xs text-muted-foreground mt-1">— {currentQuote.author}</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 h-6 text-xs"
        onClick={() => setCurrentQuote(getRandomQuote())}
      >
        <RefreshCw className="h-3 w-3 ml-1" />
        نقل قول دیگر
      </Button>
    </Card>
  )
}
