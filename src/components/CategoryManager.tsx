'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useTaskStore } from '@/lib/store'
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES, CATEGORY_COLORS, getIconByName } from '@/lib/constants'
import { Category } from '@/lib/types'
import { toast } from 'sonner'

interface CategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory, tasks } = useTaskStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // فیلدهای فرم
  const [name, setName] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [icon, setIcon] = useState('Folder')
  
  const resetForm = () => {
    setName('')
    setColor(CATEGORY_COLORS[0])
    setIcon('Folder')
    setEditingId(null)
    setShowAddForm(false)
  }
  
  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color)
    setIcon(cat.icon)
    setShowAddForm(true)
  }
  
  const handleSave = () => {
    if (!name.trim()) {
      toast.error('نام دسته را وارد کنید')
      return
    }
    
    if (editingId) {
      updateCategory(editingId, { name: name.trim(), color, icon })
      toast.success('دسته ویرایش شد')
    } else {
      addCategory({ name: name.trim(), color, icon })
      toast.success('دسته اضافه شد')
    }
    resetForm()
  }
  
  const handleDelete = (cat: Category) => {
    const count = tasks.filter((t) => t.categoryId === cat.id).length
    if (count > 0) {
      toast.error(`${count} تسک در این دسته است. ابتدا آن‌ها را جابجا کنید`)
      return
    }
    deleteCategory(cat.id)
    toast.success('دسته حذف شد')
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">مدیریت دسته‌بندی‌ها</DialogTitle>
          <DialogDescription className="text-right">
            دسته‌بندی‌ها را اضافه، ویرایش یا حذف کنید
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 max-h-[50vh] overflow-y-auto -mx-2 px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-2">
            {categories.map((cat) => {
              const Icon = getIconByName(cat.icon)
              const count = tasks.filter((t) => t.categoryId === cat.id).length
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} تسک
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStartEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {showAddForm ? (
          <div className="border-t pt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cat-name">نام دسته</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلا: ورزش"
              />
            </div>
            
            <div className="space-y-2">
              <Label>آیکن</Label>
              <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-1">
                {CATEGORY_ICON_NAMES.map((iconName) => {
                  const I = CATEGORY_ICONS[iconName]
                  const selected = icon === iconName
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`aspect-square rounded-md flex items-center justify-center border-2 transition-all ${
                        selected ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: selected ? `${color}25` : 'var(--muted)',
                        color: selected ? color : 'var(--muted-foreground)',
                      }}
                    >
                      <I className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>رنگ</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((c) => (
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
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                انصراف
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingId ? 'ذخیره' : 'افزودن'}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="h-4 w-4 ml-2" />
            افزودن دسته جدید
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
