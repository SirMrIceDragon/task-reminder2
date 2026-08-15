'use client'

import { useEffect, useState } from 'react'

export function LoadingScreen() {
  const [show, setShow] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(timer)
  }, [])
  
  if (!show) return null
  
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      <div className="relative">
        <img
          src="/loading.png"
          alt="در حال بارگذاری"
          className="w-32 h-32 animate-pulse"
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-6 animate-pulse">
        در حال بارگذاری...
      </p>
    </div>
  )
}
