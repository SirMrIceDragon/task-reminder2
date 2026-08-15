'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ExternalLink, Search, Star, BookOpen, Video, FileText,
  Award, Sparkles, Globe,
} from 'lucide-react'
import { RESOURCE_SITES, CATEGORY_LABELS, CATEGORY_EMOJIS, ResourceSite } from '@/lib/resources'
import { toPersianDigits } from '@/lib/jalali'
import { toast } from 'sonner'

type CategoryFilter = 'all' | ResourceSite['category']

export function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredSites = useMemo(() => {
    let result = RESOURCE_SITES
    
    if (activeCategory !== 'all') {
      result = result.filter((s) => s.category === activeCategory)
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.subjects.some((subj) => subj.toLowerCase().includes(q))
      )
    }
    
    return result
  }, [activeCategory, searchQuery])
  
  const groupedSites = useMemo(() => {
    const groups: Record<string, ResourceSite[]> = {}
    for (const site of filteredSites) {
      if (!groups[site.category]) groups[site.category] = []
      groups[site.category].push(site)
    }
    return groups
  }, [filteredSites])
  
  const handleOpenSite = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success(`باز کردن ${name}`)
  }
  
  const categoryOrder: ResourceSite['category'][] = ['video', 'answer', 'practice', 'other']
  
  const categoryIcons: Record<ResourceSite['category'], typeof Video> = {
    video: Video,
    answer: FileText,
    practice: Award,
    other: Sparkles,
  }
  
  return (
    <div className="px-4 py-4">
      {/* جستجو */}
      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی سایت..."
          className="pr-10"
        />
      </div>
      
      {/* فیلتر دسته‌بندی */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          همه ({toPersianDigits(RESOURCE_SITES.length)})
        </button>
        {categoryOrder.map((cat) => {
          const count = RESOURCE_SITES.filter((s) => s.category === cat).length
          const Icon = categoryIcons[cat]
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {CATEGORY_LABELS[cat]} ({toPersianDigits(count)})
            </button>
          )
        })}
      </div>
      
      {/* لیست سایت‌ها */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">سایتی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryOrder.map((cat) => {
            const sites = groupedSites[cat]
            if (!sites || sites.length === 0) return null
            
            const Icon = categoryIcons[cat]
            return (
              <section key={cat}>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {CATEGORY_LABELS[cat]}
                  <span className="text-xs">({toPersianDigits(sites.length)})</span>
                </h2>
                <div className="space-y-2">
                  {sites.map((site) => (
                    <SiteCard key={site.id} site={site} onOpen={() => handleOpenSite(site.url, site.name)} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
      
      {/* فوتر */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          {toPersianDigits(RESOURCE_SITES.length)} سایت آموزشی معتبر
        </p>
      </div>
    </div>
  )
}

function SiteCard({ site, onOpen }: { site: ResourceSite; onOpen: () => void }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onOpen}>
      <div className="flex items-start gap-3">
        <div className="text-3xl shrink-0">{site.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold truncate">{site.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {site.isFree ? (
                <Badge variant="secondary" className="text-xs h-5 bg-primary/15 text-primary">
                  رایگان
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs h-5">
                  پولی
                </Badge>
              )}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
            {site.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {site.subjects.map((subj) => (
              <Badge key={subj} variant="outline" className="text-xs h-5">
                {subj}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
