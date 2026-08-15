'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Plus, Search, SlidersHorizontal, Tags, Settings as SettingsIcon,
  AlertCircle, Inbox, ListChecks, X, Bell,
} from 'lucide-react'
import { useTaskStore } from '@/lib/store'
import { Task, Priority, PRIORITY_LABELS } from '@/lib/types'
import { getIconByName } from '@/lib/constants'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { CategoryManager } from './CategoryManager'
import { SettingsSheet } from './SettingsSheet'
import { TimerPage } from './TimerPage'
import { ProfilePage } from './ProfilePage'
import { SocialPage } from './SocialPage'
import { ResourcesPage } from './ResourcesPage'
import { QuickNotesPage } from './QuickNotesPage'
import { FocusModePage } from './FocusModePage'
import { LocationReminderPage } from './LocationReminderPage'
import { SmartAlarmPage } from './SmartAlarmPage'
import { QuoteOfTheDay } from './QuoteOfTheDay'
import { BottomNav, PageType } from './BottomNav'
import { formatJalaliDate, toPersianDigits } from '@/lib/jalali'
import {
  startNotificationChecker, stopNotificationChecker,
  stopLoopingForTask, onTaskDue, requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/notifications'
import { initAudio } from '@/lib/sounds'
import { toast } from 'sonner'
import { format, isToday, isTomorrow, isYesterday, isThisWeek } from 'date-fns'

type FilterTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'

export function TaskList() {
  const {
    tasks, categories, settings, completeTask, uncompleteTask, deleteTask,
  } = useTaskStore()
  
  const [activePage, setActivePage] = useState<PageType>('tasks')
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [activeNotifTasks, setActiveNotifTasks] = useState<Set<string>>(new Set())
  const [nowTick, setNowTick] = useState(Date.now())
  
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])
  
  useEffect(() => {
    initAudio()
    onTaskDue((task) => {
      setActiveNotifTasks((prev) => new Set(prev).add(task.id))
    })
    startNotificationChecker(() => tasks)
    return () => { stopNotificationChecker() }
  }, [tasks])
  
  useEffect(() => {
    const handler = () => {
      if (getNotificationPermission() === 'default') {
        requestNotificationPermission()
        initAudio()
        window.removeEventListener('click', handler)
      }
    }
    window.addEventListener('click', handler, { once: true })
    return () => window.removeEventListener('click', handler)
  }, [])
  
  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    const now = new Date()
    switch (activeTab) {
      case 'today':
        result = result.filter((t) => {
          const d = new Date(t.dueDate)
          return isToday(d) || (d < now && !t.completed)
        })
        break
      case 'upcoming':
        result = result.filter((t) => new Date(t.dueDate) > now && !t.completed)
        break
      case 'overdue':
        result = result.filter((t) => new Date(t.dueDate) < now && !t.completed && t.active)
        break
      case 'completed':
        result = result.filter((t) => t.completed)
        break
    }
    if (filterCategory !== 'all') result = result.filter((t) => t.categoryId === filterCategory)
    if (filterPriority !== 'all') result = result.filter((t) => t.priority === filterPriority)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }
    const sortBy = settings.sortTasksBy
    const dir = settings.sortDirection === 'asc' ? 1 : -1
    result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      let cmp = 0
      switch (sortBy) {
        case 'dueDate': cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); break
        case 'priority':
          const pOrder: Record<Priority, number> = { high: 3, medium: 2, low: 1 }
          cmp = pOrder[a.priority] - pOrder[b.priority]
          break
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break
        case 'title': cmp = a.title.localeCompare(b.title, 'fa'); break
      }
      return cmp * dir
    })
    return result
  }, [tasks, activeTab, filterCategory, filterPriority, searchQuery, settings.sortTasksBy, settings.sortDirection, nowTick])
  
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    for (const t of filteredTasks) {
      const d = new Date(t.dueDate)
      const now = new Date()
      let key: string
      if (t.completed) key = 'completed'
      else if (d < now) key = 'overdue'
      else if (isToday(d)) key = 'today'
      else if (isTomorrow(d)) key = 'tomorrow'
      else if (isYesterday(d)) key = 'yesterday'
      else if (isThisWeek(d)) key = 'this-week'
      else key = 'later'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    return groups
  }, [filteredTasks, nowTick])
  
  const handleEdit = (task: Task) => {
    setEditTask(task)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }
  
  const handleAddNew = () => {
    setEditTask(null)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }
  
  const handleStopNotif = (taskId: string) => {
    stopLoopingForTask(taskId)
    setActiveNotifTasks((prev) => { const n = new Set(prev); n.delete(taskId); return n })
  }
  
  const tabCounts = useMemo(() => {
    const now = new Date()
    return {
      all: tasks.length,
      today: tasks.filter((t) => { const d = new Date(t.dueDate); return isToday(d) || (d < now && !t.completed) }).length,
      upcoming: tasks.filter((t) => new Date(t.dueDate) > now && !t.completed).length,
      overdue: tasks.filter((t) => new Date(t.dueDate) < now && !t.completed && t.active).length,
      completed: tasks.filter((t) => t.completed).length,
    }
  }, [tasks, nowTick])
  
  const groupLabels: Record<string, string> = {
    overdue: 'تأخیر', yesterday: 'دیروز', today: 'امروز', tomorrow: 'فردا',
    'this-week': 'این هفته', later: 'بعدتر', completed: 'تکمیل شده',
  }
  const groupOrder = ['overdue', 'yesterday', 'today', 'tomorrow', 'this-week', 'later', 'completed']
  
  return (
    <div className="min-h-screen bg-background flex flex-col w-full" style={{ maxWidth: '480px', margin: '0 auto', marginLeft: 'auto', marginRight: 'auto' }}>
      {/* محتوای صفحه - scrollable */}
      <div className="flex-1 pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activePage === 'tasks' && (
          <TasksContent
            tasks={tasks}
            filteredTasks={filteredTasks}
            groupedTasks={groupedTasks}
            tabCounts={tabCounts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            categories={categories}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onOpenCategories={() => setCategoryManagerOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            activeNotifTasks={activeNotifTasks}
            onStopNotif={handleStopNotif}
            groupOrder={groupOrder}
            groupLabels={groupLabels}
          />
        )}
        {activePage === 'timer' && (
          <div>
            <PageHeader title="تایمر" subtitle="زمان‌سنجی کارهایت" />
            <TimerPage />
          </div>
        )}
        {activePage === 'social' && (
          <div>
            <PageHeader title="سوشال" subtitle="اشتراک‌گذاری با دیگران" />
            <SocialPage />
          </div>
        )}
        {activePage === 'notes' && (
          <div>
            <PageHeader title="یادداشت سریع" subtitle="یادداشت‌های سریع و رنگی" />
            <QuickNotesPage />
          </div>
        )}
        {activePage === 'focus' && (
          <div>
            <PageHeader title="حالت تمرکز" subtitle="تمرکز کامل بدون حواس‌پرتی" />
            <FocusModePage />
          </div>
        )}
        {activePage === 'location' && (
          <div>
            <PageHeader title="یادآور مکان" subtitle="یادآوری بر اساس موقعیت" />
            <LocationReminderPage />
          </div>
        )}
        {activePage === 'smartAlarm' && (
          <div>
            <PageHeader title="بیدار شو!" subtitle="آلارم هوشمند صبحگاهی" />
            <SmartAlarmPage />
          </div>
        )}
        {activePage === 'resources' && (
          <div>
            <PageHeader title="منابع درسی" subtitle="سایت‌های آموزشی معتبر" />
            <ResourcesPage />
          </div>
        )}
        {activePage === 'profile' && (
          <div>
            <PageHeader title="پروفایل" subtitle="اطلاعات کاربری" />
            <ProfilePage />
          </div>
        )}
      </div>
      
      {/* دکمه شناور - فقط در صفحه تسک‌ها */}
      {activePage === 'tasks' && (
        <button
          onClick={handleAddNew}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 h-14 px-6 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center gap-2 font-medium active:scale-95"
          style={{ maxWidth: 'calc(480px - 3rem)' }}
        >
          <Plus className="h-5 w-5" />
          تسک جدید
        </button>
      )}
      
      {/* دیالوگ‌ها */}
      <TaskForm
        key={formKey}
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditTask(null) }}
        editTask={editTask}
      />
      <CategoryManager open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      {/* ناوبری پایین - همیشه در پایین */}
      <BottomNav
        active={activePage}
        onChange={setActivePage}
        taskOverdueCount={tabCounts.overdue}
      />
    </div>
  )
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b safe-top">
      <div className="px-4 py-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </header>
  )
}

interface TasksContentProps {
  tasks: Task[]
  filteredTasks: Task[]
  groupedTasks: Record<string, Task[]>
  tabCounts: Record<FilterTab, number>
  activeTab: FilterTab
  setActiveTab: (t: FilterTab) => void
  searchQuery: string
  setSearchQuery: (s: string) => void
  showFilters: boolean
  setShowFilters: (b: boolean) => void
  filterCategory: string
  setFilterCategory: (s: string) => void
  filterPriority: string
  setFilterPriority: (s: string) => void
  categories: { id: string; name: string; color: string; icon: string }[]
  onAddNew: () => void
  onEdit: (t: Task) => void
  onOpenCategories: () => void
  onOpenSettings: () => void
  activeNotifTasks: Set<string>
  onStopNotif: (id: string) => void
  groupOrder: string[]
  groupLabels: Record<string, string>
}

function TasksContent(props: TasksContentProps) {
  const {
    tasks, filteredTasks, groupedTasks, tabCounts,
    activeTab, setActiveTab, searchQuery, setSearchQuery,
    showFilters, setShowFilters,
    filterCategory, setFilterCategory,
    filterPriority, setFilterPriority,
    categories, onAddNew, onEdit, onOpenCategories, onOpenSettings,
    activeNotifTasks, onStopNotif, groupOrder, groupLabels,
  } = props
  
  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold">یادآور تسک‌ها</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {toPersianDigits(filteredTasks.length)} تسک · {toPersianDigits(tabCounts.overdue)} تأخیر
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onOpenCategories} className="h-10 w-10">
                <Tags className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onOpenSettings} className="h-10 w-10">
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی تسک..."
              className="pr-10 pl-10"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md ${
                showFilters || filterCategory !== 'all' || filterPriority !== 'all' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            {([
              { key: 'all', label: 'همه' },
              { key: 'today', label: 'امروز' },
              { key: 'upcoming', label: 'آینده' },
              { key: 'overdue', label: 'تأخیر' },
              { key: 'completed', label: 'تکمیل' },
            ] as { key: FilterTab; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 rounded-full ${activeTab === tab.key ? 'bg-primary-foreground/20' : 'bg-background'}`}>
                  {toPersianDigits(tabCounts[tab.key])}
                </span>
              </button>
            ))}
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    {filterCategory === 'all' ? 'همه دسته‌ها' : categories.find(c => c.id === filterCategory)?.name || 'دسته'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setFilterCategory('all')}>همه دسته‌ها</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => setFilterCategory(c.id)}>{c.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    {filterPriority === 'all' ? 'همه اولویت‌ها' : PRIORITY_LABELS[filterPriority as Priority]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setFilterPriority('all')}>همه اولویت‌ها</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                    <DropdownMenuItem key={p} onClick={() => setFilterPriority(p)}>{PRIORITY_LABELS[p]}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>
      
      <QuoteOfTheDay />
      
      {activeNotifTasks.size > 0 && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-medium text-destructive shrink-0">نوتیف فعال:</span>
            {Array.from(activeNotifTasks).map((taskId) => {
              const t = tasks.find((x) => x.id === taskId)
              if (!t) return null
              return (
                <Badge key={taskId} variant="destructive" className="shrink-0 cursor-pointer gap-1" onClick={() => onStopNotif(taskId)}>
                  <Bell className="h-3 w-3" />
                  {t.title.slice(0, 15)}
                  <X className="h-3 w-3" />
                </Badge>
              )
            })}
          </div>
        </div>
      )}
      
      <main className="px-4 py-4">
        {filteredTasks.length === 0 ? (
          <EmptyState hasTasks={tasks.length > 0} onAdd={onAddNew} />
        ) : (
          <div className="space-y-6">
            {groupOrder.map((groupKey) => {
              const groupTasks = groupedTasks[groupKey]
              if (!groupTasks || groupTasks.length === 0) return null
              return (
                <section key={groupKey}>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1 flex items-center gap-2">
                    {groupKey === 'overdue' && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                    {groupKey === 'today' && <ListChecks className="h-3.5 w-3.5" />}
                    {groupLabels[groupKey]}
                    <span className="text-xs">({toPersianDigits(groupTasks.length)})</span>
                  </h2>
                  <div className="space-y-2">
                    {groupTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={onEdit} onNotifStop={onStopNotif} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({ hasTasks, onAdd }: { hasTasks: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        {hasTasks ? <Inbox className="h-10 w-10 text-muted-foreground" /> : <ListChecks className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{hasTasks ? 'هیچ تسکی یافت نشد' : 'هنوز تسکی ندارید'}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {hasTasks ? 'با تغییر فیلترها یا عبارت جستجو، تسک‌های بیشتری ببینید' : 'اولین تسک خود را اضافه کنید'}
      </p>
      {!hasTasks && (
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 ml-2" />
          ایجاد تسک
        </Button>
      )}
    </div>
  )
}
