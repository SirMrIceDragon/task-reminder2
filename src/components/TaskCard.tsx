'use client'

import { createElement } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Clock, Bell, BellOff, MoreVertical, Pencil, Trash2,
  AlarmClockOff, RotateCw, Power, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { Task, PRIORITY_LABELS, PRIORITY_COLORS, NOTIFICATION_TYPE_LABELS } from '@/lib/types'
import { useTaskStore } from '@/lib/store'
import { getIconByName } from '@/lib/constants'
import { stopLoopingForTask } from '@/lib/notifications'
import { describeDueDate, relativeTime, formatJalaliDateTime, toPersianDigits } from '@/lib/jalali'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onNotifStop?: (taskId: string) => void
  compact?: boolean
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return createElement(getIconByName(name), { className })
}

export function TaskCard({ task, onEdit, onNotifStop, compact = false }: TaskCardProps) {
  const { completeTask, uncompleteTask, deleteTask, toggleActive, snoozeTask, getCategory } = useTaskStore()
  const category = getCategory(task.categoryId)
  
  const dueDate = new Date(task.dueDate)
  const now = new Date()
  const isOverdue = !task.completed && task.active && dueDate < now
  const isDueSoon = !task.completed && task.active && dueDate > now && (dueDate.getTime() - now.getTime()) < 60 * 60 * 1000 // 1 hour
  
  const stopNotif = () => {
    stopLoopingForTask(task.id)
    onNotifStop?.(task.id)
  }
  
  const handleComplete = () => {
    if (task.completed) {
      uncompleteTask(task.id)
    } else {
      completeTask(task.id)
      stopNotif()
    }
  }
  
  const handleSnooze = (minutes: number) => {
    snoozeTask(task.id, minutes)
    stopNotif()
  }
  
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 ${
        task.completed ? 'opacity-60' : ''
      } ${isOverdue ? 'ring-2 ring-destructive/40' : ''} ${
        !task.active && !task.completed ? 'opacity-50' : ''
      }`}
      style={{
        borderRightWidth: '4px',
        borderRightColor: category?.color || 'var(--border)',
      }}
    >
      {/* نوار رنگی اولویت */}
      <div
        className="absolute top-0 right-0 h-1 w-full"
        style={{ background: PRIORITY_COLORS[task.priority] }}
      />
      
      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            className="mt-1 shrink-0"
            aria-label={task.completed ? 'بازگردانی تسک' : 'تکمیل تسک'}
          >
            <div
              className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/30 hover:border-primary'
              }`}
            >
              {task.completed && <CheckCircle2 className="h-4 w-4" />}
            </div>
          </button>
          
          {/* محتوای اصلی */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-base leading-tight truncate ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && !compact && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              
              {/* منوی کشویی */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Pencil className="h-4 w-4 ml-2" />
                      ویرایش
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSnooze(5)}>
                    <AlarmClockOff className="h-4 w-4 ml-2" />
                    تعویق ۵ دقیقه
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnooze(15)}>
                    <AlarmClockOff className="h-4 w-4 ml-2" />
                    تعویق ۱۵ دقیقه
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnooze(60)}>
                    <AlarmClockOff className="h-4 w-4 ml-2" />
                    تعویق ۱ ساعت
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { toggleActive(task.id); if (task.active) stopNotif() }}>
                    <Power className="h-4 w-4 ml-2" />
                    {task.active ? 'غیرفعال کردن' : 'فعال کردن'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => { deleteTask(task.id); stopNotif() }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* زمان سررسید */}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Clock className={`h-3.5 w-3.5 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span
                className={`${
                  isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                }`}
              >
                {describeDueDate(dueDate)}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs h-5 px-1.5">
                  <AlertCircle className="h-3 w-3 ml-1" />
                  تأخیر
                </Badge>
              )}
              {isDueSoon && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {relativeTime(dueDate)}
                </Badge>
              )}
              {task.snoozedUntil && new Date(task.snoozedUntil) > now && (
                <Badge variant="outline" className="text-xs h-5 px-1.5">
                  <AlarmClockOff className="h-3 w-3 ml-1" />
                  تعویق تا {toPersianDigits(format(new Date(task.snoozedUntil), 'HH:mm'))}
                </Badge>
              )}
            </div>
            
            {/* برچسب‌ها و ویژگی‌ها */}
            {!compact && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {category && (
                  <Badge
                    variant="secondary"
                    className="text-xs h-6 gap-1"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    <CategoryIcon name={category.icon} className="h-3 w-3" />
                    {category.name}
                  </Badge>
                )}
                
                <Badge
                  variant="outline"
                  className="text-xs h-6 gap-1"
                  style={{
                    color: PRIORITY_COLORS[task.priority],
                    borderColor: `${PRIORITY_COLORS[task.priority]}40`,
                  }}
                >
                  اولویت: {PRIORITY_LABELS[task.priority]}
                </Badge>
                
                {task.recurringEnabled ? (
                  <Badge variant="outline" className="text-xs h-6 gap-1 text-primary">
                    <RotateCw className="h-3 w-3" />
                    تکرار روزانه
                  </Badge>
                ) : null}
                
                <Badge variant="outline" className="text-xs h-6 gap-1">
                  {task.notificationType === 'silent' ? (
                    <>
                      <BellOff className="h-3 w-3" />
                      بی‌صدا
                    </>
                  ) : (
                    <>
                      <Bell className="h-3 w-3" />
                      {NOTIFICATION_TYPE_LABELS[task.notificationType]}
                    </>
                  )}
                </Badge>
                
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs h-6">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
