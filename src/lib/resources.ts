// لیست سایت‌های آموزشی معتبر ایرانی

export interface ResourceSite {
  id: string
  name: string
  url: string
  description: string
  category: 'video' | 'answer' | 'practice' | 'other'
  subjects: string[]
  emoji: string
  isFree: boolean
}

export const RESOURCE_SITES: ResourceSite[] = [
  // ===== سایت‌های ویدئویی =====
  {
    id: 'maz',
    name: 'مآز',
    url: 'https://www.maz.ir',
    description: 'پلتفرم آموزش ویدئویی با هزاران دوره آموزشی در زمینه‌های مختلف تحصیلی، کنکور و دانشگاهی. ویدئوهای باکیفیت از بهترین اساتید.',
    category: 'video',
    subjects: ['کنکور', 'دبیرستان', 'دانشگاه'],
    emoji: '🎬',
    isFree: false,
  },
  {
    id: 'sebtar',
    name: 'سیب ترش',
    url: 'https://sebtar.com',
    description: 'سامانه آموزش ویدئویی سیب ترش با دوره‌های تخصصی کنکور و دبیرستان. ویدئوهای تدریس اساتید برتر به صورت فصل به فصل.',
    category: 'video',
    subjects: ['کنکور', 'دبیرستان'],
    emoji: '🍎',
    isFree: false,
  },
  {
    id: 'alaa',
    name: 'آلاء',
    url: 'https://alaatv.com',
    description: 'پلتفرم آموزشی آلاء با ویدئوهای آموزشی رایگان و پولی برای مقاطع مختلف تحصیلی. یکی از قدیمی‌ترین سایت‌های آموزش ویدئویی.',
    category: 'video',
    subjects: ['کنکور', 'دبیرستان', 'راهنمایی'],
    emoji: '🎥',
    isFree: true,
  },
  {
    id: 'mekted',
    name: 'مکتب‌خونه',
    url: 'https://www.maktabkhooneh.org',
    description: 'پلتفرم آموزش آنلاین با دوره‌های دانشگاهی و تخصصی. همکاری با دانشگاه‌های معتبر ایران و ارائه دوره‌های бесплат و پولی.',
    category: 'video',
    subjects: ['دانشگاه', 'تخصصی'],
    emoji: '🏫',
    isFree: true,
  },
  {
    id: 'faradars',
    name: 'فرادرس',
    url: 'https://faradars.org',
    description: 'بزرگترین پلتفرم آموزش ویدئویی ایران با هزاران دوره در زمینه‌های مختلف از برنامه‌نویسی و طراحی تا کنکور و زبان.',
    category: 'video',
    subjects: ['برنامه‌نویسی', 'طراحی', 'کنکور', 'زبان'],
    emoji: '📹',
    isFree: false,
  },
  {
    id: 'ostadbank',
    name: 'استادبانک',
    url: 'https://ostadbank.com',
    description: 'پلتفرم آموزشی ویدئویی با دوره‌های کنکور و دبیرستان. امکان مشاهده اولین جلسه هر دوره به صورت رایگان.',
    category: 'video',
    subjects: ['کنکور', 'دبیرستان'],
    emoji: '👨‍🏫',
    isFree: false,
  },

  // ===== سایت‌های جواب کتاب =====
  {
    id: 'magerta',
    name: 'ماگرتا',
    url: 'https://magerta.com',
    description: 'مرجع کامل پاسخنامه کتاب‌های درسی ایران. جواب تمامی کتاب‌های مدرسه از ابتدایی تا پیش‌دانشگاهی با توضیح کامل.',
    category: 'answer',
    subjects: ['دبیرستان', 'راهنمایی', 'ابتدایی'],
    emoji: '📚',
    isFree: true,
  },
  {
    id: 'padars',
    name: 'پادرس',
    url: 'https://padars.com',
    description: 'سامانه پاسخنامه کتاب‌های درسی با جواب‌نویسی مرحله به مرحله. مناسب دانش‌آموزان مقاطع متوسطه و ثانویه.',
    category: 'answer',
    subjects: ['دبیرستان', 'راهنمایی'],
    emoji: '✏️',
    isFree: true,
  },
  {
    id: 'gama',
    name: 'گاما',
    url: 'https://gama.ir',
    description: 'پلتفرم آموزشی با پاسخنامه کتاب‌های درسی، ویدئوهای آموزشی و آزمون آنلاین. مرجع کامل دانش‌آموزان ایرانی.',
    category: 'answer',
    subjects: ['دبیرستان', 'کنکور'],
    emoji: '🎯',
    isFree: true,
  },
  {
    id: 'koodak',
    name: 'فرادرس‌کودک',
    url: 'https://faradars.org/course/kids',
    description: 'بخش کودک فرادرس با آموزش‌های ویدئویی مناسب کودکان. شامل آموزش‌های علوم، ریاضی و زبان برای سنین پایه.',
    category: 'video',
    subjects: ['ابتدایی', 'کودک'],
    emoji: '🧒',
    isFree: false,
  },
  {
    id: 'khaak',
    name: 'خاک‌دانش',
    url: 'https://khakdansh.ir',
    description: 'سایت آموزشی با پاسخنامه و حل تمرین کتاب‌های درسی. مناسب برای تمرین و مرور دروس مختلف.',
    category: 'answer',
    subjects: ['دبیرستان', 'راهنمایی'],
    emoji: '📖',
    isFree: true,
  },

  // ===== سایت‌های تمرین و آزمون =====
  {
    id: 'sana',
    name: 'سامانه سنجش',
    url: 'https://azmoun.ir',
    description: 'سامانه رسمی سازمان سنجش برای ثبت‌نام و نتایج آزمون‌های سراسری کنکور و سایر آزمون‌های ملی.',
    category: 'practice',
    subjects: ['کنکور', 'آزمون ملی'],
    emoji: '📊',
    isFree: true,
  },
  {
    id: 'mehri',
    name: 'مهرین',
    url: 'https://mehrin.ir',
    description: 'پلتفرم آزمون آنلاین با آزمون‌های آزمایشی کنکور، بررسی نقاط ضعف و نقاط قوی، و گزارش تحلیلی کامل.',
    category: 'practice',
    subjects: ['کنکور'],
    emoji: '📝',
    isFree: false,
  },
  {
    id: 'mirath',
    name: 'میراث',
    url: 'https://mirath.ir',
    description: 'سایت آزمون‌های آزمایشی آنلاین با تحلیل عملکرد و رتبه‌بندی. مناسب برای آمادگی کنکور.',
    category: 'practice',
    subjects: ['کنکور'],
    emoji: '🥇',
    isFree: false,
  },

  // ===== سایت‌های متفرقه مفید =====
  {
    id: 'roshd',
    name: 'پایگاه آموزشی رشد',
    url: 'https://www.roshd.ir',
    description: 'پایگاه رسمی آموزش و پرورش با منابع آموزشی، ویدئوهای درسی و مطالب کمک‌آموزشی برای تمامی مقاطع.',
    category: 'other',
    subjects: ['ابتدایی', 'راهنمایی', 'دبیرستان'],
    emoji: '🌱',
    isFree: true,
  },
  {
    id: 'sharif',
    name: 'دانشگاه شریف',
    url: 'https://www.sharif.edu',
    description: 'سایت رسمی دانشگاه شریف با منابع آموزشی، اخبار و رویدادهای علمی. مناسب برای دانشجویان و داوطلبان کنکور.',
    category: 'other',
    subjects: ['دانشگاه', 'کنکور'],
    emoji: '🎓',
    isFree: true,
  },
  {
    id: 'iranhls',
    name: 'مدرسه آنلاین ایران',
    url: 'https://iran-hls.com',
    description: 'پلتفرم آموزش آنلاین با کلاس‌های زنده و ویدئویی برای تمامی مقاطع تحصیلی. امکان یادگیری در خانه.',
    category: 'video',
    subjects: ['دبیرستان', 'راهنمایی', 'ابتدایی'],
    emoji: '💻',
    isFree: false,
  },
]

export const CATEGORY_LABELS: Record<ResourceSite['category'], string> = {
  video: 'سایت‌های ویدئویی',
  answer: 'سایت‌های جواب کتاب',
  practice: 'سایت‌های آزمون و تمرین',
  other: 'سایت‌های مفید',
}

export const CATEGORY_EMOJIS: Record<ResourceSite['category'], string> = {
  video: '🎬',
  answer: '📚',
  practice: '📝',
  other: '🌟',
}
