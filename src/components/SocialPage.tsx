'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Heart, MessageCircle, Share2, Bookmark, Plus, Image as ImageIcon,
  Clock, CheckCircle2, Trash2, Send, X, AlertCircle,
} from 'lucide-react'
import { useExtendedStore } from '@/lib/extended-store'
import { useTaskStore } from '@/lib/store'
import { Post, MAX_POST_WORDS, MAX_COMMENT_WORDS } from '@/lib/social-types'
import { toPersianDigits, formatJalaliDate, relativeTime } from '@/lib/jalali'
import { formatDurationHuman, formatSeconds } from '@/lib/time-format'
import { toast } from 'sonner'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function timeAgo(date: string): string {
  try {
    return relativeTime(new Date(date))
  } catch {
    return ''
  }
}

export function SocialPage() {
  const {
    posts, savedPosts,
    createPost, deletePost, likePost, commentOnPost, sharePost, savePost,
  } = useExtendedStore()
  const { profile } = useExtendedStore()
  const { tasks } = useTaskStore()
  const [showNewPost, setShowNewPost] = useState(false)
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed')
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  
  const visiblePosts = activeTab === 'feed' ? posts : posts.filter((p) => savedPosts.includes(p.id))
  
  return (
    <div className="px-4 py-4">
      {/* تب‌ها */}
      <div className="flex gap-2 mb-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-2 -mx-4 px-4">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'feed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          فید
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            activeTab === 'saved' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          ذخیره‌شده
          {savedPosts.length > 0 && (
            <span className="text-xs opacity-80">({toPersianDigits(savedPosts.length)})</span>
          )}
        </button>
      </div>
      
      {/* دکمه پست جدید */}
      <Button
        onClick={() => setShowNewPost(true)}
        className="w-full h-12 mb-4"
      >
        <Plus className="h-5 w-5 ml-2" />
        پست جدید
      </Button>
      
      {/* لیست پست‌ها */}
      {visiblePosts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {activeTab === 'feed' ? 'هنوز پستی وجود ندارد' : 'پستی ذخیره نکرده‌اید'}
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwn={post.authorId === 'me'}
              isLiked={post.likes.includes('me')}
              isSaved={savedPosts.includes(post.id)}
              isCommenting={commentingPostId === post.id}
              commentText={commentText}
              onLike={() => likePost(post.id)}
              onShare={() => { sharePost(post.id); toast.success('پست اشتراک گذاشته شد') }}
              onSave={() => savePost(post.id)}
              onDelete={() => {
                if (confirm('پست حذف شود؟')) {
                  deletePost(post.id)
                  toast.success('پست حذف شد')
                }
              }}
              onCommentStart={() => {
                setCommentingPostId(post.id)
                setCommentText('')
              }}
              onCommentCancel={() => setCommentingPostId(null)}
              onCommentSubmit={() => {
                if (commentText.trim()) {
                  commentOnPost(post.id, commentText)
                  setCommentText('')
                  setCommentingPostId(null)
                }
              }}
              onCommentChange={setCommentText}
            />
          ))}
        </div>
      )}
      
      <NewPostDialog
        open={showNewPost}
        onOpenChange={setShowNewPost}
        onCreate={(data) => {
          createPost(data)
          toast.success('پست منتشر شد')
          setShowNewPost(false)
        }}
        profileName={profile.name || 'من'}
      />
    </div>
  )
}

function PostCard({
  post, isOwn, isLiked, isSaved, isCommenting, commentText,
  onLike, onShare, onSave, onDelete, onCommentStart, onCommentCancel, onCommentSubmit, onCommentChange,
}: {
  post: Post
  isOwn: boolean
  isLiked: boolean
  isSaved: boolean
  isCommenting: boolean
  commentText: string
  onLike: () => void
  onShare: () => void
  onSave: () => void
  onDelete: () => void
  onCommentStart: () => void
  onCommentCancel: () => void
  onCommentSubmit: () => void
  onCommentChange: (v: string) => void
}) {
  return (
    <Card className="overflow-hidden">
      {/* هدر */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10">
            {post.authorAvatarType === 'image' ? (
              <img src={post.authorAvatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : post.authorAvatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{post.authorName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwn && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* نوع پست */}
      {post.type !== 'general' && (
        <div className="px-3 pb-2">
          <Badge variant="secondary" className="text-xs gap-1">
            {post.type === 'task_share' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {post.type === 'task_share' ? 'تسک' : 'تایمر'}
          </Badge>
        </div>
      )}
      
      {/* متن */}
      {post.text && (
        <div className="px-3 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {toPersianDigits(post.wordCount)} کلمه
          </p>
        </div>
      )}
      
      {/* اشتراک‌گذاری تسک/تایمر */}
      {(post.type === 'task_share' || post.type === 'timer_share') && (
        <div className="mx-3 mb-3 rounded-lg border bg-muted/50 p-3">
          {post.originalDeleted ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>
                {post.type === 'task_share'
                  ? `تسک "${post.sharedTaskTitle}" پاک شده است`
                  : `تایمر "${post.sharedTimerName}" پاک شده است`}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {post.type === 'task_share' ? '✅' : '⏱️'}
                </span>
                <span className="font-semibold text-sm">
                  {post.type === 'task_share' ? post.sharedTaskTitle : post.sharedTimerName}
                </span>
              </div>
              {post.type === 'timer_share' && post.sharedTimerSeconds && (
                <p className="text-xs text-muted-foreground">
                  زمان: {formatDurationHuman(post.sharedTimerSeconds)}
                </p>
              )}
            </>
          )}
        </div>
      )}
      
      {/* تصویر */}
      {post.image && (
        <div className="px-3 pb-3">
          <img
            src={post.image}
            alt=""
            className="w-full rounded-lg max-h-96 object-cover"
          />
        </div>
      )}
      
      {/* دکمه‌های تعامل */}
      <div className="flex items-center gap-1 px-2 py-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`flex-1 ${isLiked ? 'text-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ml-1 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">{toPersianDigits(post.likes.length)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentStart}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 ml-1" />
          <span className="text-xs">{toPersianDigits(post.comments.length)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 ml-1" />
          <span className="text-xs">{toPersianDigits(post.shares)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={`flex-1 ${isSaved ? 'text-amber-500' : ''}`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      {/* کامنت‌ها */}
      {post.comments.length > 0 && (
        <div className="px-3 pb-2 space-y-2 border-t pt-2">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="text-xs bg-muted">{c.authorAvatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted/50 rounded-lg px-2 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{c.authorName}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-xs mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* فرم کامنت */}
      {isCommenting && (
        <div className="px-3 pb-3 pt-2 border-t flex gap-2">
          <Input
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="نظر بنویس..."
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommentSubmit()
            }}
          />
          <Button size="icon" onClick={onCommentSubmit} className="h-9 w-9">
            <Send className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onCommentCancel} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}

function NewPostDialog({
  open, onOpenChange, onCreate, profileName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (data: { text: string; image?: string; type?: Post['type'] }) => void
  profileName: string
}) {
  const taskStore = useTaskStore()
  const extendedStore = useExtendedStore()
  const { tasks } = taskStore
  const { timerSessions, createPost } = extendedStore
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const wordCount = countWords(text)
  const remaining = MAX_POST_WORDS - wordCount
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast.error('تصویر باید کمتر از ۳ مگابایت باشد')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }
  
  const handleSubmit = () => {
    if (!text.trim() && !image) {
      toast.error('متن یا تصویر وارد کنید')
      return
    }
    if (wordCount > MAX_POST_WORDS) {
      toast.error(`حداکثر ${toPersianDigits(MAX_POST_WORDS)} کلمه`)
      return
    }
    onCreate({ text: text.trim(), image })
    setText('')
    setImage(undefined)
    setShowShareOptions(false)
  }
  
  // اشتراک‌گذاری تسک
  const completedTasks = tasks.filter((t) => t.completed)
  const completedTimers = timerSessions.filter((t) => t.status === 'completed')
  
  const shareTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    createPost({
      text: text.trim() || `تسک "${task.title}" رو کامل کردم! 🎉`,
      image,
      type: 'task_share',
      sharedTaskId: task.id,
      sharedTaskTitle: task.title,
    })
    toast.success('تسک به فید اضافه شد')
    onOpenChange(false)
    setText('')
    setImage(undefined)
  }
  
  const shareTimer = (timerId: string) => {
    const timer = timerSessions.find((t) => t.id === timerId)
    if (!timer) return
    createPost({
      text: text.trim() || `${timer.emoji} ${formatDurationHuman(timer.elapsedSeconds)} کار کردم!`,
      image,
      type: 'timer_share',
      sharedTimerId: timer.id,
      sharedTimerName: timer.name,
      sharedTimerSeconds: timer.elapsedSeconds,
    })
    toast.success('تایمر به فید اضافه شد')
    onOpenChange(false)
    setText('')
    setImage(undefined)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle className="text-right">پست جدید</DialogTitle>
          <DialogDescription className="text-right">
            به عنوان {profileName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="چی می‌خوای بنویسی؟"
            rows={4}
            maxLength={1000}
          />
          <div className="flex items-center justify-between text-xs">
            <span className={remaining < 20 ? 'text-amber-500' : 'text-muted-foreground'}>
              {toPersianDigits(wordCount)}/{toPersianDigits(MAX_POST_WORDS)} کلمه
            </span>
            {remaining < 0 && (
              <span className="text-destructive">
                {toPersianDigits(Math.abs(remaining))} کلمه اضافه
              </span>
            )}
          </div>
          
          {/* پیش‌نمایش تصویر */}
          {image && (
            <div className="relative">
              <img src={image} alt="" className="w-full rounded-lg max-h-64 object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 h-7 w-7"
                onClick={() => setImage(undefined)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          
          {/* دکمه‌ها */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="post-image"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <ImageIcon className="h-4 w-4 ml-2" />
              تصویر
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 ml-2" />
              اشتراک تسک/تایمر
            </Button>
          </div>
          
          {/* گزینه‌های اشتراک‌گذاری */}
          {showShareOptions && (
            <div className="rounded-lg border p-2 space-y-2 max-h-48 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {completedTasks.length === 0 && completedTimers.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-3">
                  هنوز تسک یا تایمر تکمیل‌شده‌ای ندارید
                </p>
              ) : (
                <>
                  {completedTasks.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => shareTask(t.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm text-right"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </button>
                  ))}
                  {completedTimers.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => shareTimer(t.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm text-right"
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span className="truncate flex-1">{t.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatSeconds(t.elapsedSeconds, false)}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-background py-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={(!text.trim() && !image) || wordCount > MAX_POST_WORDS}
            >
              انتشار
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
