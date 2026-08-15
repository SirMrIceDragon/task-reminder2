// سیستم ترجمه فارسی/انگلیسی

export type Language = 'fa' | 'en'

export const translations = {
  fa: {
    // ناوبری
    tasks: 'تسک‌ها',
    timer: 'تایمر',
    social: 'سوشال',
    resources: 'منابع',
    profile: 'پروفایل',
    
    // صفحه تسک‌ها
    taskReminder: 'یادآور تسک‌ها',
    tasks_count: (n: number) => `${n} تسک`,
    overdue_count: (n: number) => `${n} تأخیر`,
    searchTasks: 'جستجوی تسک...',
    all: 'همه',
    today: 'امروز',
    upcoming: 'آینده',
    overdue: 'تأخیر',
    completed: 'تکمیل',
    newTask: 'تسک جدید',
    noTasks: 'هنوز تسکی ندارید',
    createFirstTask: 'اولین تسک خود را اضافه کنید',
    createTask: 'ایجاد تسک',
    
    // گروه‌ها
    yesterday: 'دیروز',
    tomorrow: 'فردا',
    thisWeek: 'این هفته',
    later: 'بعدتر',
    
    // تایمر
    stopwatch: 'کرونومتر',
    alarm: 'آلارم ساعت',
    pomodoro: 'پومودورو',
    startNewTimer: 'شروع کرونومتر جدید',
    recentSessions: 'جلسات اخیر',
    totalTimeToday: 'کل زمان امروز',
    
    // پروفایل
    personalInfo: 'اطلاعات شخصی',
    activityStats: 'آمار فعالیت',
    memberSince: 'عضو از',
    
    // تنظیمات
    settings: 'تنظیمات',
    appearance: 'ظاهر',
    theme: 'تم اپلیکیشن',
    light: 'روشن',
    dark: 'تاریک',
    system: 'سیستم',
    calendar: 'تقویم',
    useJalali: 'استفاده از تقویم جلالی',
    notifications: 'نوتیفیکیشن',
    language: 'زبان',
    
    // منابع
    educationalResources: 'منابع درسی',
    searchSites: 'جستجوی سایت...',
    videoSites: 'سایت‌های ویدئویی',
    answerSites: 'سایت‌های جواب کتاب',
    practiceSites: 'سایت‌های آزمون و تمرین',
    usefulSites: 'سایت‌های مفید',
    free: 'رایگان',
    paid: 'پولی',
    
    // ویژگی‌های جدید
    focusMode: 'حالت تمرکز',
    focusModeDesc: 'تمرکز کامل بدون حواس‌پرتی',
    startFocus: 'شروع تمرکز',
    stopFocus: 'توقف تمرکز',
    focusDuration: 'مدت تمرکز',
    focusMinutes: 'دقیقه',
    quickNote: 'یادداشت سریع',
    quickNoteDesc: 'سریع یادداشت بنویس',
    voiceAssistant: 'دستیار صوتی',
    voiceAssistantDesc: 'تسک با صدا بساز',
    speakNow: 'حالا صحبت کن...',
    voiceNotSupported: 'مرورگر شما از دستیار صوتی پشتیبانی نمی‌کند',
    
    // نقل قول
    quoteOfTheDay: 'نقل قول روز',
    
    // آلارم صبحگاهی
    smartAlarm: 'بیدار شو!',
    smartAlarmDesc: 'آلارم هوشمند صبحگاهی',
    wakeUp: 'وقت بیداری!',
    solvePuzzle: 'برای توقف، معما را حل کن',
    stop: 'توقف',
    
    // حالت تمرکز
    stayFocused: 'متمرکز باش',
    dontGiveUp: 'تسليم نشو',
    keepGoing: 'ادامه بده',
    youCanDoIt: 'تو می‌تونی',
    
    // پیوست
    attachments: 'پیوست‌ها',
    addAttachment: 'افزودن پیوست',
    photo: 'عکس',
    file: 'فایل',
    audio: 'صوت',
    
    // یادآور مکان
    locationReminder: 'یادآور مکان',
    whenArrive: 'وقتی رسیدی به',
    whenLeave: 'وقتی رفتی از',
    selectLocation: 'انتخاب مکان',
    
    // عمومی
    save: 'ذخیره',
    cancel: 'انصراف',
    delete: 'حذف',
    edit: 'ویرایش',
    close: 'بستن',
    yes: 'بله',
    no: 'خیر',
    ok: 'باشه',
  },
  en: {
    // Navigation
    tasks: 'Tasks',
    timer: 'Timer',
    social: 'Social',
    resources: 'Resources',
    profile: 'Profile',
    
    // Tasks page
    taskReminder: 'Task Reminder',
    tasks_count: (n: number) => `${n} tasks`,
    overdue_count: (n: number) => `${n} overdue`,
    searchTasks: 'Search tasks...',
    all: 'All',
    today: 'Today',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    completed: 'Completed',
    newTask: 'New Task',
    noTasks: 'No tasks yet',
    createFirstTask: 'Create your first task',
    createTask: 'Create Task',
    
    // Groups
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    later: 'Later',
    
    // Timer
    stopwatch: 'Stopwatch',
    alarm: 'Alarm Clock',
    pomodoro: 'Pomodoro',
    startNewTimer: 'Start New Stopwatch',
    recentSessions: 'Recent Sessions',
    totalTimeToday: 'Total Time Today',
    
    // Profile
    personalInfo: 'Personal Info',
    activityStats: 'Activity Stats',
    memberSince: 'Member since',
    
    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    theme: 'App Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    calendar: 'Calendar',
    useJalali: 'Use Jalali Calendar',
    notifications: 'Notifications',
    language: 'Language',
    
    // Resources
    educationalResources: 'Educational Resources',
    searchSites: 'Search sites...',
    videoSites: 'Video Sites',
    answerSites: 'Answer Book Sites',
    practiceSites: 'Practice & Test Sites',
    usefulSites: 'Useful Sites',
    free: 'Free',
    paid: 'Paid',
    
    // New features
    focusMode: 'Focus Mode',
    focusModeDesc: 'Full focus without distractions',
    startFocus: 'Start Focus',
    stopFocus: 'Stop Focus',
    focusDuration: 'Focus Duration',
    focusMinutes: 'minutes',
    quickNote: 'Quick Note',
    quickNoteDesc: 'Quickly write a note',
    voiceAssistant: 'Voice Assistant',
    voiceAssistantDesc: 'Create task with voice',
    speakNow: 'Speak now...',
    voiceNotSupported: 'Your browser does not support voice assistant',
    
    // Quote
    quoteOfTheDay: 'Quote of the Day',
    
    // Smart alarm
    smartAlarm: 'Wake Up!',
    smartAlarmDesc: 'Smart morning alarm',
    wakeUp: 'Time to wake up!',
    solvePuzzle: 'Solve puzzle to stop',
    stop: 'Stop',
    
    // Focus mode
    stayFocused: 'Stay Focused',
    dontGiveUp: 'Don\'t Give Up',
    keepGoing: 'Keep Going',
    youCanDoIt: 'You Can Do It',
    
    // Attachments
    attachments: 'Attachments',
    addAttachment: 'Add Attachment',
    photo: 'Photo',
    file: 'File',
    audio: 'Audio',
    
    // Location reminder
    locationReminder: 'Location Reminder',
    whenArrive: 'When arriving at',
    whenLeave: 'When leaving from',
    selectLocation: 'Select Location',
    
    // General
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
  },
}

export type TranslationKey = keyof typeof translations.fa

export function t(lang: Language, key: TranslationKey): string {
  const val = translations[lang][key] || translations.fa[key] || key
  return typeof val === 'string' ? val : key
}

export function tf(lang: Language, key: TranslationKey, n: number): string {
  const val = translations[lang][key]
  return typeof val === 'function' ? val(n) : String(val)
}
