import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Users, Search, Calendar, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type Member = {
  id: string
  member_number: string
  full_name: string
  father_name: string | null
  occupation: string | null
  status: string
  joined_date: string
  families: { family_name: string } | null
}

export function PublicMembersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['public-members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('members')
        .select('id, member_number, full_name, father_name, occupation, status, joined_date, families(family_name)')
        .order('member_number', { ascending: true })
      return (data ?? []) as Member[]
    },
  })

  const statusVariant: Record<string, 'success' | 'secondary' | 'destructive'> = {
    active: 'success',
    inactive: 'secondary',
    deceased: 'destructive',
  }
  const statusLabel: Record<string, string> = {
    active: t('public.active'),
    inactive: t('public.inactive'),
    deceased: t('public.deceased'),
  }

  const filtered = (data ?? []).filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.member_number.toLowerCase().includes(q) ||
      (m.father_name ?? '').toLowerCase().includes(q) ||
      (m.families?.family_name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('public.memberDirectory')}</h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 si-wrap">
        <Search className="si-icon absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
        <Input
          className="ltr:pl-9 rtl:pr-9"
          placeholder={t('public.searchMembers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-16">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{t('public.noMembers')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{m.full_name}</p>
                    {m.father_name && (
                      <p className="text-xs text-muted-foreground">s/o {m.father_name}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant[m.status] ?? 'secondary'} className="text-xs shrink-0">
                    {statusLabel[m.status] ?? m.status}
                  </Badge>
                </div>

                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p className="font-mono font-medium text-foreground">{m.member_number}</p>
                  {m.families?.family_name && (
                    <p className="flex items-center gap-1">
                      <span className="text-foreground font-medium">{t('public.family')}:</span>
                      {m.families.family_name}
                    </p>
                  )}
                  {m.occupation && (
                    <p className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 shrink-0" />
                      {m.occupation}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {t('public.joined')}: {formatDate(m.joined_date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
