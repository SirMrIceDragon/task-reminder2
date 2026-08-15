'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceButtonProps {
  onResult: (text: string) => void
  label?: string
}

export function VoiceButton({ onResult, label }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  
  const handleVoice = () => {
    if (typeof window === 'undefined') return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      toast.error('مرورگر شما از دستیار صوتی پشتیبانی نمی‌کند')
      return
    }
    
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    
    const recognition = new SpeechRecognition()
    recognition.lang = 'fa-IR'
    recognition.continuous = false
    recognition.interimResults = false
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      toast.success('متن اضافه شد')
    }
    
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        toast.error('دسترسی میکروفون داده نشد')
      } else {
        toast.error('خطا در تشخیص صدا')
      }
      setIsListening(false)
    }
    
    recognition.onend = () => setIsListening(false)
    
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
    toast.info('حالا صحبت کن...', { duration: 2000 })
  }
  
  return (
    <Button
      type="button"
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={handleVoice}
      className="shrink-0"
      aria-label={label || 'دستیار صوتی'}
    >
      {isListening ? (
        <MicOff className="h-4 w-4 animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}
