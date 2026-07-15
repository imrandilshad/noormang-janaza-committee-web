import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, Calendar, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type AnnouncementType = 'all' | 'death_notice' | 'meeting' | 'general'

type Announcement = {
  id: string
  title: string
  content: string
  type: string
  created_at: string
}

export function PublicAnnouncementsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<AnnouncementType>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, content, type, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      return (data ?? []) as Announcement[]
    },
  })

  const typeLabel: Record<string, string> = {
    death_notice: t('public.deathNotice'),
    meeting: t('public.meeting'),
    general: t('public.general'),
  }
  const typeVariant: Record<string, 'destructive' | 'default' | 'secondary'> = {
    death_notice: 'destructive',
    meeting: 'default',
    general: 'secondary',
  }

  const filters: { key: AnnouncementType; label: string }[] = [
    { key: 'all', label: t('public.filterAll') },
    { key: 'death_notice', label: t('public.filterDeathNotice') },
    { key: 'meeting', label: t('public.filterMeeting') },
    { key: 'general', label: t('public.filterGeneral') },
  ]

  const filtered = (data ?? []).filter((a) => {
    const matchesFilter = filter === 'all' || a.type === filter
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('public.announcements')}</h1>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 si-wrap">
          <Search className="si-icon absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
          <Input
            className="ltr:pl-9 rtl:pr-9"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-16">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{t('public.noAnnouncements')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-base leading-snug">{a.title}</h2>
                  <Badge variant={typeVariant[a.type] ?? 'secondary'} className="shrink-0">
                    {typeLabel[a.type] ?? a.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{a.content}</p>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(a.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
