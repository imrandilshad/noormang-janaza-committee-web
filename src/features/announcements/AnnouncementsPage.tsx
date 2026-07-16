import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { AnnouncementCardSkeleton } from '@/components/shared/Skeletons'
import { formatDate } from '@/lib/utils'
import type { Announcement } from '@/types/database'

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['death_notice', 'meeting', 'general']),
  is_public: z.boolean(),
})
type AnnouncementForm = z.infer<typeof schema>

const typeVariant = { death_notice: 'destructive', meeting: 'default', general: 'secondary' } as const

export function AnnouncementsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      return data ?? []
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<AnnouncementForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'general', is_public: false },
  })

  const upsert = useMutation({
    mutationFn: async (values: AnnouncementForm) => {
      if (editing) {
        await supabase.from('announcements').update(values).eq('id', editing.id)
      } else {
        await supabase.from('announcements').insert(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setOpen(false)
      reset()
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('announcements').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })

  const openEdit = (a: Announcement) => {
    setEditing(a)
    reset({ title: a.title, content: a.content, type: a.type, is_public: a.is_public })
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background pt-4 lg:pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('announcement.announcementList')}</h1>
        <Button onClick={() => { setEditing(null); reset({ type: 'general', is_public: false }); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('announcement.addAnnouncement')}
        </Button>
      </div>

      {isLoading ? (
        <AnnouncementCardSkeleton count={4} showActions />
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">{t('common.noData')}</CardContent>
            </Card>
          ) : (
            announcements.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{a.title}</h3>
                        <Badge variant={(typeVariant[a.type as keyof typeof typeVariant] ?? 'secondary') as 'default' | 'secondary' | 'destructive'}>
                          {t(`announcement.${a.type === 'death_notice' ? 'deathNotice' : a.type}`)}
                        </Badge>
                        {a.is_public && <Badge variant="outline">Public</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{a.content}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('common.edit') : t('announcement.addAnnouncement')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => upsert.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('announcement.title')} *</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('announcement.type')}</Label>
              <Select value={watch('type')} onValueChange={(v) => setValue('type', v as AnnouncementForm['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="death_notice">{t('announcement.deathNotice')}</SelectItem>
                  <SelectItem value="meeting">{t('announcement.meeting')}</SelectItem>
                  <SelectItem value="general">{t('announcement.general')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('announcement.content')} *</Label>
              <Textarea {...register('content')} rows={4} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_public" {...register('is_public')} className="h-4 w-4" />
              <Label htmlFor="is_public">{t('announcement.isPublic')}</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={isSubmitting || upsert.isPending}>
                {editing ? t('common.update') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
