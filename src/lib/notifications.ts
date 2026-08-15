// سیستم مدیریت نوتیفیکیشن‌ها - چک کردن تسک‌های سررسیده و نمایش نوتیف

'use client'

import { Task } from './types'
import { playLoopingNotification, playNotificationSound, LoopHandle } from './sounds'

let checkInterval: number | null = null
let activeLoops: Map<string, LoopHandle> = new Map()
let pendingTasks: Map<string, Task> = new Map() // تسک‌هایی که نوتیف داده‌ایم ولی کامل نشده‌اند
let onTaskDueCallback: ((task: Task) => void) | null = null

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  try {
    const perm = await Notification.requestPermission()
    return perm
  } catch {
    return 'denied'
  }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

// چک کردن اینکه آیا یک تسک سررسیده است
export function isTaskDue(task: Task, now: Date = new Date()): boolean {
  if (!task.active || task.completed) return false
  if (task.snoozedUntil && new Date(task.snoozedUntil) > now) return false
  
  const dueDate = new Date(task.dueDate)
  return dueDate <= now
}

// چک کردن اینکه آیا تسک باید امروز دوباره نوتیف داده شود (تکرار روزانه)
export function shouldRepeatToday(task: Task, now: Date = new Date()): boolean {
  if (!task.recurringEnabled || task.completed || !task.active) return false
  if (task.snoozedUntil && new Date(task.snoozedUntil) > now) return false
  
  const dueDate = new Date(task.dueDate)
  // اگر هنوز سررسیده نشده، نه
  if (dueDate > now) return false
  
  // اگر امروز هستیم و هنوز سر زمان نیست
  const today = new Date(now)
  today.setHours(dueDate.getHours(), dueDate.getMinutes(), dueDate.getSeconds(), 0)
  
  // اگر زمان فعلی >= زمان امروز تسک
  return now >= today
}

// نمایش نوتیفیکیشن مرورگر
function showBrowserNotification(task: Task): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null
  
  try {
    const notif = new Notification(`⏰ ${task.title}`, {
      body: task.notificationText || 'یادآوری تسک',
      tag: `task-${task.id}`,
      requireInteraction: task.notificationType === 'alarm' || task.notificationType === 'call',
      silent: task.notificationType === 'silent',
      icon: '/logo.svg',
    })
    
    notif.onclick = () => {
      window.focus()
      notif.close()
      stopLoopingForTask(task.id)
    }
    
    return notif
  } catch (e) {
    console.error('Notification error:', e)
    return null
  }
}

// شروع صدا و ویبره برای تسک
function startLoopingForTask(task: Task) {
  if (activeLoops.has(task.id)) return
  
  if (task.notificationType === 'silent') return
  
  const handle = playLoopingNotification({
    soundId: task.notificationSound,
    type: task.notificationType,
    volume: task.notificationVolume,
    vibrate: task.notificationVibrate,
  })
  activeLoops.set(task.id, handle)
}

// توقف صدای یک تسک (نوتیف همچنان در حالت pending می‌ماند تا دوباره فعال نشود)
export function stopLoopingForTask(taskId: string) {
  const handle = activeLoops.get(taskId)
  if (handle) {
    handle.stop()
    activeLoops.delete(taskId)
  }
  // توجه: pendingTasks را پاک نمی‌کنیم تا چکر دوباره نوتیف ندهد
  // pendingTasks فقط با complete/snooze/غیرفعال‌سازی پاک می‌شود
}

// پاک کردن یک تسک از حالت pending (وقتی کامل شد یا snooze شد)
export function clearPendingTask(taskId: string) {
  pendingTasks.delete(taskId)
  stopLoopingForTask(taskId)
}

// توقف تمام صداها
export function stopAllLoops() {
  activeLoops.forEach((handle) => handle.stop())
  activeLoops.clear()
  pendingTasks.clear()
}

// ثبت callback برای وقتی تسک سررسیده می‌شود
export function onTaskDue(callback: (task: Task) => void) {
  onTaskDueCallback = callback
}

// چک کردن تسک‌های سررسیده
function checkDueTasks(tasks: Task[]) {
  const now = new Date()
  
  for (const task of tasks) {
    if (!task.active || task.completed) {
      // اگر تسک غیرفعال یا کامل شد، صدا را قطع کن و از pending پاک کن
      if (pendingTasks.has(task.id)) {
        clearPendingTask(task.id)
      }
      continue
    }
    
    // اگر تسک snooze شده، نوتیف را قطع کن اما pending را نگه دار
    if (task.snoozedUntil && new Date(task.snoozedUntil) > now) {
      if (pendingTasks.has(task.id)) {
        stopLoopingForTask(task.id)
      }
      continue
    }
    
    const due = isTaskDue(task, now)
    const shouldRepeat = shouldRepeatToday(task, now)
    
    if ((due || shouldRepeat) && !pendingTasks.has(task.id)) {
      pendingTasks.set(task.id, task)
      showBrowserNotification(task)
      
      if (task.notificationType === 'alarm' || task.notificationType === 'call') {
        startLoopingForTask(task)
      } else if (task.notificationType !== 'silent') {
        // یک بار صدا برای default
        playNotificationSound({
          soundId: task.notificationSound,
          type: task.notificationType,
          volume: task.notificationVolume,
          vibrate: task.notificationVibrate,
        })
      }
      
      if (onTaskDueCallback) onTaskDueCallback(task)
    }
  }
}

// شروع چکر دوره‌ای
export function startNotificationChecker(getTasks: () => Task[]) {
  if (checkInterval !== null) return
  
  // چک اولیه
  checkDueTasks(getTasks())
  
  // هر 5 ثانیه چک کن
  checkInterval = window.setInterval(() => {
    checkDueTasks(getTasks())
  }, 5000)
}

export function stopNotificationChecker() {
  if (checkInterval !== null) {
    clearInterval(checkInterval)
    checkInterval = null
  }
  stopAllLoops()
}

// تست نوتیفیکیشن
export function testNotification(task: Partial<Task> = {}) {
  const mockTask: Task = {
    id: 'test-' + Date.now(),
    title: task.title || 'تسک تست',
    description: '',
    categoryId: 'other',
    dueDate: new Date().toISOString(),
    hasTime: true,
    completed: false,
    active: true,
    notificationText: task.notificationText || 'این یک تست است',
    notificationType: task.notificationType || 'default',
    notificationSound: task.notificationSound || 'chime',
    notificationVolume: task.notificationVolume ?? 70,
    notificationVibrate: task.notificationVibrate ?? true,
    recurringEnabled: false,
    repeatType: 'none',
    repeatIntervalDays: 1,
    priority: 'medium',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  showBrowserNotification(mockTask)
  
  if (mockTask.notificationType === 'alarm' || mockTask.notificationType === 'call') {
    const handle = playLoopingNotification({
      soundId: mockTask.notificationSound,
      type: mockTask.notificationType,
      volume: mockTask.notificationVolume,
      vibrate: mockTask.notificationVibrate,
    })
    // توقف بعد از 5 ثانیه برای تست
    setTimeout(() => handle.stop(), 5000)
  } else if (mockTask.notificationType !== 'silent') {
    playNotificationSound({
      soundId: mockTask.notificationSound,
      type: mockTask.notificationType,
      volume: mockTask.notificationVolume,
      vibrate: mockTask.notificationVibrate,
    })
  }
}
