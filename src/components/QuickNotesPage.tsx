'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pin, PinOff, Trash2, Edit, Mic, MicOff, Search } from 'lucide-react'
import { useNewFeaturesStore } from '@/lib/features-store'
import { NOTE_COLORS, QuickNote } from '@/lib/new-features-types'
import { toPersianDigits, formatJalaliDate } from '@/lib/jalali'
import { toast } from 'sonner'

export function QuickNotesPage() {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNewFeaturesStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editNote, setEditNote] = useState<typeof notes[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredNotes = notes.filter((n) =>
    n.text.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const pinnedNotes = filteredNotes.filter((n) => n.pinned)
  const normalNotes = filteredNotes.filter((n) => !n.pinned)
  
  return (
    <div className="px-4 py-4 space-y-4">
      {/* جستجو */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی یادداشت..."
          className="pr-10"
        />
      </div>
      
      {/* دکمه یادداشت جدید */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="w-full h-12"
      >
        <Plus className="h-5 w-5 ml-2" />
        یادداشت جدید
      </Button>
      
      {/* آمار */}
      <p className="text-xs text-muted-foreground text-center">
        {toPersianDigits(notes.length)} یادداشت · {toPersianDigits(pinnedNotes.length)} سنجاق‌شده
      </p>
      
      {/* یادداشت‌های سنجاق‌شده */}
      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1 flex items-center gap-1">
            <Pin className="h-3.5 w-3.5" />
            سنجاق‌شده
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditNote(note)}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => togglePin(note.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* بقیه یادداشت‌ها */}
      {normalNotes.length > 0 ? (
        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
              سایر یادداشت‌ها
            </h2>
          )}
          <div className="grid grid-cols-2 gap-2">
            {normalNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditNote(note)}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => togglePin(note.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        notes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Plus className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">هنوز یادداشتی ندارید</p>
          </div>
        )
      )}
      
      <NoteDialog
        key={showAddDialog ? 'add' : editNote?.id || 'closed'}
        open={showAddDialog || !!editNote}
        onOpenChange={(v) => {
          if (!v) {
            setShowAddDialog(false)
            setEditNote(null)
          }
        }}
        editNote={editNote}
        onSave={(text, color) => {
          if (editNote) {
            updateNote(editNote.id, { text, color })
            toast.success('یادداشت ویرایش شد')
          } else {
            addNote(text, color)
            toast.success('یادداشت اضافه شد')
          }
          setShowAddDialog(false)
          setEditNote(null)
        }}
      />
    </div>
  )
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: {
  note: QuickNote
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}) {
  return (
    <Card
      className="p-3 relative group"
      style={{ backgroundColor: note.color }}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs text-muted-foreground">
          {formatJalaliDate(new Date(note.createdAt), false)}
        </p>
        <button onClick={onTogglePin} className="opacity-60 hover:opacity-100">
          {note.pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="text-sm whitespace-pre-wrap line-clamp-6">{note.text}</p>
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  )
}

function NoteDialog({ open, onOpenChange, editNote, onSave }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editNote: QuickNote | null
  onSave: (text: string, color: string) => void
}) {
  const [text, setText] = useState(editNote?.text || '')
  const [color, setColor] = useState(editNote?.color || NOTE_COLORS[0])
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  
  const handleVoice = () => {
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
      setText((prev) => prev + (prev ? ' ' : '') + transcript)
      toast.success('متن اضافه شد')
    }
    
    recognition.onerror = (event: any) => {
      toast.error('خطا در تشخیص صدا')
      setIsListening(false)
    }
    
    recognition.onend = () => setIsListening(false)
    
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
    toast.info('حالا صحبت کن...')
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {editNote ? 'ویرایش یادداشت' : 'یادداشت جدید'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="یادداشتت رو بنویس..."
              rows={6}
              autoFocus
            />
          </div>
          
          {/* دکمه صوتی */}
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleVoice}
            className="w-full"
          >
            {isListening ? <MicOff className="h-4 w-4 ml-2" /> : <Mic className="h-4 w-4 ml-2" />}
            {isListening ? 'در حال شنیدن...' : 'گفتاری'}
          </Button>
          
          {/* رنگ */}
          <div className="space-y-2">
            <p className="text-sm font-medium">رنگ یادداشت</p>
            <div className="flex gap-2 flex-wrap">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>انصراف</Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (text.trim()) {
                  onSave(text.trim(), color)
                }
              }}
              disabled={!text.trim()}
            >
              ذخیره
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
